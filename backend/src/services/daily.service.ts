import { TZDate } from "@date-fns/tz";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import { isSameDay } from "date-fns";
import seedrandom from "seedrandom";
import { DAILY_CHALLENGE_GUESS_LIMIT } from "../constants/game.js";
import { pokemon_v2_pokemontype } from "../generated/prisma-sqlite/client.js";
import { getOverallTypeEffectiveness } from "../lib/matchups.js";
import { DailyPokemonToResponse } from "../mappers/daily.js";
import {
  createDailyPokemon,
  deleteUserGuessesForDate,
  getDailyPokemonFromDb,
  getLastRngState,
  getUserDailyStatsData,
  getUserGuessCountForDate,
  getUserGuessesForDate,
  hasPokemonAppearedInLastMonth,
  migrateUserGuesses,
  saveUserGuess,
} from "../repositories/daily.repository.js";
import {
  getNumDefaultPokemon,
  getPokemonForDaily,
} from "../repositories/pokemon.repository.js";
import { tryParseNum } from "../utils/parse.js";
import { Comp, DailyPokemon } from "../utils/types.js";

// Helper function to check if two dates are consecutive days
const isConsecutiveDay = (date1: Date, date2: Date): boolean => {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
  const diffInDays = Math.abs(date2.getTime() - date1.getTime()) / oneDay;
  return diffInDays <= 1;
};

let dailyPokemons: Record<string, DailyPokemon> = {};

export const getDailyPokemon = async (date: string) => {
  if (dailyPokemons[date]) {
    return dailyPokemons[date];
  }

  // First, try to get from database
  const existingChallenge = await getDailyPokemonFromDb(date);

  if (existingChallenge) {
    // Get the pokemon data from the static database
    const pokemon = await getPokemonForDaily({
      id: existingChallenge.pokemonId,
    });
    if (!pokemon) {
      throw new Error("unable to get daily pokemon");
    }
    dailyPokemons[date] = pokemon;
    return pokemon;
  }

  const numPokemon = await getNumDefaultPokemon();
  const lastRngState = await getLastRngState(date);
  const rng = seedrandom.alea(process.env.RANDOM_SEED! + date, {
    state: lastRngState ?? true,
  });
  let pokemon: DailyPokemon | null = await (async () => {
    // If not in database, generate new daily pokemon
    while (true) {
      const randomIndex = Math.floor(rng() * numPokemon);
      const dailyPokemon = await getPokemonForDaily({ offset: randomIndex });
      if (!dailyPokemon) {
        throw new Error("unable to get daily pokemon");
      }
      if (await hasPokemonAppearedInLastMonth(dailyPokemon.id)) {
        continue;
      }
      return dailyPokemon;
    }
  })();

  const { pokemonId } = await createDailyPokemon(
    date,
    pokemon.id,
    JSON.stringify(rng.state()),
  );
  if (pokemonId != pokemon.id) {
    pokemon = await getPokemonForDaily({ id: pokemonId });
  }

  if (!pokemon) {
    throw new Error("unable to get daily pokemon");
  }

  dailyPokemons[date] = pokemon;
  return pokemon;
};

export const submitGuess = async (
  userId: string,
  pokemonId: number,
  date: string,
): Promise<DailyChallengeGuessResponse> => {
  let guessNumber: number | undefined;
  // Get the current guess number for this user and date
  const currentGuessCount = await getUserGuessCountForDate(userId, date);
  if (currentGuessCount === DAILY_CHALLENGE_GUESS_LIMIT) {
    throw new Error("hit limit");
  }
  guessNumber = currentGuessCount + 1;

  // Verify the guess
  const result = await verifyGuess(pokemonId, date);
  if (!userId || guessNumber === undefined) {
    return result;
  }

  if (result.correct) {
    // Save the correct guess
    await saveUserGuess({
      userId,
      date,
      pokemonId,
      guessNumber,
      isCorrect: true,
      type1Correctness: "=",
      type2Correctness: "=",
      genCorrectness: "=",
      heightCorrectness: "=",
      colorCorrectness: true,
    });

    return result;
  }

  // Save the incorrect guess
  await saveUserGuess({
    userId,
    date,
    pokemonId,
    guessNumber,
    isCorrect: false,
    type1Correctness: result.type1Correctness.toString(),
    type2Correctness: result.type2Correctness.toString(),
    genCorrectness: result.genCorrectness,
    heightCorrectness: result.heightCorrectness,
    colorCorrectness: result.colorCorrectness,
  });

  return result;
};

export const getUserGuessesForDateService = async (
  userId: string,
  date: string,
) => {
  const guesses = await getUserGuessesForDate(userId, date);

  // Convert database records to response format
  const results: DailyChallengeGuessResponse[] = [];

  for (const guess of guesses) {
    const pokemon = await getPokemonForDaily({ id: guess.pokemonId });
    if (!pokemon) continue;

    if (guess.isCorrect) {
      results.push({
        correct: true,
        pokemon: await DailyPokemonToResponse(pokemon),
        pokemonId: guess.pokemonId,
      });
    } else {
      results.push({
        type1Correctness: tryParseNum(guess.type1Correctness) as number | "=",
        type2Correctness: tryParseNum(guess.type2Correctness) as
          | number
          | "="
          | "NA",
        genCorrectness: tryParseNum(guess.genCorrectness) as "=" | "<" | ">",
        heightCorrectness: guess.heightCorrectness as "=" | "<" | ">",
        colorCorrectness: guess.colorCorrectness,
        pokemon: await DailyPokemonToResponse(pokemon),
        pokemonId: guess.pokemonId,
      });
    }
  }

  return results;
};

export const verifyGuess = async (
  pokemonId: number,
  date: string,
): Promise<DailyChallengeGuessResponse> => {
  const [targetPokemon, guessPokemon] = await Promise.all([
    getDailyPokemon(date),
    getPokemonForDaily({ id: pokemonId }),
  ]);

  if (!targetPokemon || !guessPokemon) {
    throw new Error("Invalid Pokemon data");
  }

  if (targetPokemon.id === guessPokemon.id) {
    return {
      correct: true,
      pokemon: await DailyPokemonToResponse(targetPokemon),
      pokemonId,
    };
  }

  // For this function, we want to check the following:
  // 1. The guess pokemons type 1 is super effective, effective, or not very effective against the target pokemons types
  // 2. The guess pokemons type 2 is super effective, effective, or not very effective against the target pokemons types.
  //    If the pokemon does not have a type 2, treat it as normal effectiveness.
  // 3. The generation of the guess pokemon is the same, less or higher than the target pokemon.
  // 4. The height of the guess pokemon is the same, less or higher than the target pokemon.
  // 5. The color of the guess pokemon is the same as the target pokemon.
  const guessType1: pokemon_v2_pokemontype =
    guessPokemon.pokemon_v2_pokemontype[0];
  const guessType2: pokemon_v2_pokemontype | undefined =
    guessPokemon.pokemon_v2_pokemontype[1];
  const targetType1: pokemon_v2_pokemontype =
    targetPokemon.pokemon_v2_pokemontype[0];
  const targetType2: pokemon_v2_pokemontype | undefined =
    targetPokemon.pokemon_v2_pokemontype[1];

  const guessGen =
    guessPokemon.pokemon_v2_pokemonform[0]?.pokemon_v2_versiongroup
      ?.generation_id;

  if (!guessGen) {
    throw new Error("Cannot get generation of guess pokemon");
  }

  const targetGen =
    targetPokemon.pokemon_v2_pokemonform[0]?.pokemon_v2_versiongroup
      ?.generation_id;

  if (!targetGen) {
    throw new Error("Cannot get generation of target pokemon");
  }

  if (
    guessPokemon.pokemon_v2_pokemonspecies?.pokemon_color_id ===
      targetPokemon.pokemon_v2_pokemonspecies?.pokemon_color_id &&
    targetGen === guessGen &&
    targetPokemon.height === guessPokemon.height &&
    targetType1.type_id === guessType1.type_id &&
    targetType2?.type_id === guessType2?.type_id
  ) {
    return {
      correct: true,
      pokemon: await DailyPokemonToResponse(targetPokemon),
      pokemonId,
    };
  }

  const type1Correctness =
    guessType1.type_id === targetType1.type_id ||
    guessType1.type_id === targetType2?.type_id
      ? "="
      : await getOverallTypeEffectiveness(
          guessType1.type_id!,
          targetType1.type_id!,
          targetType2?.type_id,
        );

  const type2Correctness =
    guessType2?.type_id === targetType2?.type_id ||
    guessType2?.type_id === targetType1.type_id
      ? "="
      : guessType2
        ? await getOverallTypeEffectiveness(
            guessType2.type_id!,
            targetType1.type_id!,
            targetType2?.type_id,
          )
        : "NA";

  const genCorrectness: Comp =
    targetGen < guessGen ? "<" : guessGen == targetGen ? "=" : ">";

  const heightCorrectness: Comp =
    targetPokemon.height! < guessPokemon.height!
      ? "<"
      : targetPokemon.height == guessPokemon.height
        ? "="
        : ">";

  const colorCorrectness =
    guessPokemon.pokemon_v2_pokemonspecies?.pokemon_color_id ==
    targetPokemon.pokemon_v2_pokemonspecies?.pokemon_color_id;

  return {
    type1Correctness,
    type2Correctness,
    genCorrectness,
    heightCorrectness,
    colorCorrectness,
    pokemon: await DailyPokemonToResponse(guessPokemon),
    pokemonId,
  };
};

export const getDailyPokemonAnswer = async (date: string) => {
  const targetPokemon = await getDailyPokemon(date);
  if (!targetPokemon) {
    throw new Error("Unable to get daily pokemon");
  }

  return {
    pokemonId: targetPokemon.id,
    pokemon: await DailyPokemonToResponse(targetPokemon),
  };
};

export const syncUserGuesses = async (
  userId: string | undefined,
  posthogDistinctId: string | undefined,
  guesses: { pokemonId: number }[],
  date: string,
) => {
  if (!userId && !posthogDistinctId) {
    throw new Error("User ID and Posthog Distinct ID are required");
  }

  // First, get existing guesses for this user and date
  const existingGuesses = userId
    ? await getUserGuessesForDateService(userId, date)
    : [];
  const existingGuessesForPh = posthogDistinctId
    ? await getUserGuessesForDateService(posthogDistinctId, date)
    : [];

  if (existingGuesses.length > 0) {
    // User already has data for this day
    if (existingGuessesForPh.length > 0) {
      await deleteUserGuessesForDate(posthogDistinctId!, date);
    }
    return {
      syncedGuesses: [],
      existingGuesses,
      message: `User already has ${existingGuesses.length} guesses for this date`,
    };
  }

  // if posthog distinct id has data but user id does not, means user just logged in
  if (existingGuessesForPh.length > 0) {
    await migrateUserGuesses(posthogDistinctId!, userId!);
    return {
      syncedGuesses: existingGuessesForPh,
      existingGuesses: [],
      message: `Successfully synced ${existingGuessesForPh.length} guesses`,
    };
  }

  // User has no existing data, means local storage has stuff but
  // user_id and posthogDistinctId don't have data
  const syncedGuesses: DailyChallengeGuessResponse[] = [];

  for (const guess of guesses) {
    try {
      const result = await submitGuess(
        userId ?? posthogDistinctId!,
        guess.pokemonId,
        date,
      );
      syncedGuesses.push(result);
    } catch (error) {
      console.error(
        `Failed to sync guess for pokemon ${guess.pokemonId}:`,
        error,
      );
    }
  }

  return {
    syncedGuesses,
    existingGuesses: [],
    message: `Successfully synced ${syncedGuesses.length} guesses`,
  };
};

export const getUserStats = async (userId: string) => {
  const statsData = await getUserDailyStatsData(userId);
  const today = TZDate.tz(SINGAPORE_TIMEZONE);
  const histogram: Record<number, number> = statsData.reduce(
    (acc, day) => {
      if (day.correct) {
        acc[day.count] = (acc[day.count] || 0) + 1;
      } else if (day.count === DAILY_CHALLENGE_GUESS_LIMIT) {
        acc[-1] = (acc[-1] || 0) + 1;
      }
      return acc;
    },
    {} as Record<number, number>,
  );

  if (statsData.length === 0) {
    return {
      num_played: 0,
      win_rate: 0,
      streak: 0,
      max_streak: 0,
      histogram: {},
    };
  }

  // Calculate number of games played (unique days with guesses)
  const num_played = statsData.length;

  // Calculate wins (days where max isCorrect is true)
  const wins = statsData.filter((day) => day.correct).length;

  // Calculate win rate as percentage
  const win_rate = Math.round((wins / num_played) * 100);

  // Calculate streaks
  let maxStreak = 0;
  let streak = 0;

  // Convert date strings to Date objects for comparison
  const formattedDays = statsData.map((day) => ({
    date: new TZDate(day.dailyChallengeId, SINGAPORE_TIMEZONE),
    isWin: day.correct,
  }));

  for (let i = 0; i < formattedDays.length; i++) {
    const day = formattedDays[i];
    const isFirstDay = i === 0;
    const isConsecutiveFromPrevious =
      !isFirstDay && isConsecutiveDay(formattedDays[i - 1].date, day.date);

    if (day.isWin && (isFirstDay || isConsecutiveFromPrevious)) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }

  if (
    formattedDays.length > 0 &&
    !isSameDay(today, formattedDays[formattedDays.length - 1].date)
  ) {
    streak = 0;
  }

  return {
    num_played,
    win_rate,
    streak,
    max_streak: maxStreak,
    histogram,
  };
};
