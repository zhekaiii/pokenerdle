import { PokemonNamesResponse, PokemonWithAbilities } from "@pokenerdle/shared";
import { MAX_ABILITY_LINKS, MAX_EVOLUTION_LINKS } from "../constants/game.js";
import { TurnResult } from "../controllers/types.js";
import { prisma } from "../lib/prisma.js";
import * as pokemonRepository from "../repositories/pokemon.repository.js";
import { isTruthy } from "../utils/types.js";

export {
  getPokemonIcons,
  getPokemonNames,
  getPokemonWithAbilities,
} from "../repositories/pokemon.repository.js";

export const getStarterPokemon = async (): Promise<PokemonWithAbilities> => {
  const pokemonId =
    await pokemonRepository.getRandomPokemonIdWithMultipleAbilities();
  const pokemon = await pokemonRepository.getPokemonWithAbilities(pokemonId);
  if (!pokemon) {
    throw new Error("No starter Pokemon found");
  }
  return pokemon;
};

export const validatePokemon = async (
  pokemonGuess: PokemonNamesResponse,
  previousPokemonGuess: PokemonNamesResponse,
  usedLinks: Record<string, number>,
  evolutionLinkCount: number
): Promise<TurnResult> => {
  const [pokemon, previousPokemon] = await Promise.all([
    prisma.pokemon_v2_pokemon.findUniqueOrThrow({
      where: { id: pokemonGuess.id },
      include: {
        pokemon_v2_pokemonability: {
          select: { pokemon_v2_ability: true },
        },
        pokemon_v2_pokemonspecies: {
          include: {
            pokemon_v2_pokemon: true,
          },
        },
        pokemon_v2_pokemonsprites: {
          select: {
            sprites: true,
          },
        },
      },
    }),
    prisma.pokemon_v2_pokemon.findUniqueOrThrow({
      where: { id: previousPokemonGuess.id },
      include: {
        pokemon_v2_pokemonability: {
          select: { pokemon_v2_ability: true },
        },
        pokemon_v2_pokemonspecies: true,
      },
    }),
  ]);

  const isSameEvolutionChain =
    pokemon.pokemon_v2_pokemonspecies!.evolution_chain_id ===
    previousPokemon.pokemon_v2_pokemonspecies!.evolution_chain_id;

  if (isSameEvolutionChain && evolutionLinkCount >= MAX_EVOLUTION_LINKS) {
    console.log(
      `${pokemonGuess.name} is an invalid answer because the evolution link count is at maximum`
    );
    return {
      validAnswer: false,
      pokemonId: pokemonGuess.id,
    };
  }

  const commonAbilities = pokemon.pokemon_v2_pokemonability
    .map(({ pokemon_v2_ability }) => pokemon_v2_ability)
    .filter((ability) =>
      previousPokemon.pokemon_v2_pokemonability.some(
        ({ pokemon_v2_ability }) => pokemon_v2_ability?.id === ability?.id
      )
    )
    .filter(isTruthy);
  if (
    commonAbilities.length > 0 &&
    commonAbilities.every(
      (ability) => (usedLinks[ability.name] ?? 0) < MAX_ABILITY_LINKS
    )
  ) {
    console.log(`${pokemonGuess.name} is a valid answer`);
    return {
      validAnswer: true,
      pokemon: pokemonRepository.prettifyQueriedPokemon(pokemon),
      species: pokemon.pokemon_v2_pokemonspecies,
      sameSpecies:
        pokemon.pokemon_v2_pokemonspecies?.pokemon_v2_pokemon.map(
          ({ id }) => id
        ) ?? [],
      usedLinks: commonAbilities.map((ability) => ability.name),
      isSameEvoline: isSameEvolutionChain,
    };
  }
  console.log(
    `${pokemonGuess.name} is an invalid answer because ${
      commonAbilities.length > 0
        ? "all common abilities are used"
        : "no abilities are shared"
    }`
  );
  return {
    validAnswer: false,
    pokemonId: pokemonGuess.id,
  };
};
