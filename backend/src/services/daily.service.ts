import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { pokemon_v2_pokemontype } from "@prisma/client";
import seedrandom from "seedrandom";
import { DAILY_CHALLENGE_GUESS_LIMIT } from "../constants/game.js";
import { getOverallTypeEffectiveness } from "../lib/matchups.js";
import { DailyPokemonToResponse } from "../mappers/daily.js";
import {
  createDailyPokemon,
  getDailyPokemonFromDb,
  getUserGuessCountForDate,
  getUserGuessesForDate,
  saveUserGuess,
} from "../repositories/daily.repository.js";
import {
  getNumDefaultPokemon,
  getPokemonForDaily,
} from "../repositories/pokemon.repository.js";
import { tryParseNum } from "../utils/parse.js";
import { Comp, DailyPokemon } from "../utils/types.js";

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

  // If not in database, generate new daily pokemon
  const rng = seedrandom.alea(process.env.RANDOM_SEED! + date);
  const numPokemon = await getNumDefaultPokemon();
  const randomIndex = Math.floor(rng() * numPokemon);
  let pokemon = await getPokemonForDaily({ offset: randomIndex });

  if (!pokemon) {
    throw new Error("unable to get daily pokemon");
  }

  const { pokemonId } = await createDailyPokemon(date, pokemon.id);
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
  userId: string | undefined,
  pokemonId: number,
  date: string
): Promise<DailyChallengeGuessResponse> => {
  let guessNumber: number | undefined;
  if (userId) {
    // Get the current guess number for this user and date
    const currentGuessCount = await getUserGuessCountForDate(userId, date);
    if (currentGuessCount === DAILY_CHALLENGE_GUESS_LIMIT) {
      throw new Error("hit limit");
    }
    guessNumber = currentGuessCount + 1;
  }

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
  date: string
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
  date: string
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
          targetType2?.type_id
        );

  const type2Correctness =
    guessType2?.type_id === targetType2?.type_id ||
    guessType2?.type_id === targetType1.type_id
      ? "="
      : guessType2
      ? await getOverallTypeEffectiveness(
          guessType2.type_id!,
          targetType1.type_id!,
          targetType2?.type_id
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
