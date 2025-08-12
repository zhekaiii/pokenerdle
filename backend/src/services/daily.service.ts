import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { pokemon_v2_pokemontype } from "@prisma/client";
import seedrandom from "seedrandom";
import { getOverallTypeEffectiveness } from "../lib/matchups.js";
import { DailyPokemonToResponse } from "../mappers/daily.js";
import {
  getNumDefaultPokemon,
  getPokemonForDaily,
} from "../repositories/pokemon.repository.js";
import { Comp, DailyPokemon } from "../utils/types.js";

let dailyPokemons: Record<string, DailyPokemon> = {};

const getDailyPokemon = async (date: string) => {
  const dailyPokemon = dailyPokemons[date];
  if (dailyPokemon) {
    return dailyPokemon;
  }
  const rng = seedrandom.alea(process.env.RANDOM_SEED! + date);
  const numPokemon = await getNumDefaultPokemon();
  const randomIndex = Math.floor(rng() * numPokemon);
  const pokemon = await getPokemonForDaily({ offset: randomIndex });
  if (!pokemon) {
    throw new Error("unable to get daily pokemon");
  }
  dailyPokemons[date] = pokemon;
  return pokemon;
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
  };
};
