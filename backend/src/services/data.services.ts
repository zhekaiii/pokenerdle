import { PokemonWithAbilities } from "@pokenerdle/shared";
import {
  MAX_ABILITY_LINKS,
  MAX_EVOLUTION_LINKS,
  TurnResult,
} from "../controllers/types.js";
import {
  getPokemonWithAbilities,
  getRandomPokemonIdWithMultipleAbilities,
  prettifyQueriedPokemon,
} from "../repositories/pokemon.repository.js";
import { isTruthy } from "../utils/types.js";

export const getPokemonNames = async () => {
  const pokemons = await prisma.pokemon_v2_pokemon.findMany({
    select: { name: true },
    orderBy: { id: "asc" },
  });
  return pokemons.map(({ name }) => name);
};

export const getStarterPokemon = async (): Promise<PokemonWithAbilities> => {
  const pokemonId = await getRandomPokemonIdWithMultipleAbilities();
  const pokemon = await getPokemonWithAbilities(pokemonId);
  if (!pokemon) {
    throw new Error("No starter Pokemon found");
  }
  return pokemon;
};

export const validatePokemon = async (
  pokemonName: string,
  previousPokemonName: string,
  usedLinks: Record<string, number>,
  evolutionLinkCount: number
): Promise<TurnResult> => {
  const [pokemon, previousPokemon] = await Promise.all([
    prisma.pokemon_v2_pokemon.findFirstOrThrow({
      where: { name: pokemonName },
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
    prisma.pokemon_v2_pokemon.findFirstOrThrow({
      where: { name: previousPokemonName },
      include: {
        pokemon_v2_pokemonability: {
          select: { pokemon_v2_ability: true },
        },
        pokemon_v2_pokemonspecies: true,
      },
    }),
  ]);
  const pokemonFullName = pokemon.pokemon_v2_pokemonspecies!.name;

  const isSameEvolutionChain =
    pokemon.pokemon_v2_pokemonspecies!.evolution_chain_id ===
    previousPokemon.pokemon_v2_pokemonspecies!.evolution_chain_id;

  if (isSameEvolutionChain && evolutionLinkCount >= MAX_EVOLUTION_LINKS) {
    console.log(
      `${pokemonName} is an invalid answer because the evolution link count is at maximum`
    );
    return {
      validAnswer: false,
      pokemonName: pokemonFullName,
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
    console.log(`${pokemonName} is a valid answer`);
    return {
      validAnswer: true,
      pokemon: prettifyQueriedPokemon(pokemon),
      sameSpecies:
        pokemon.pokemon_v2_pokemonspecies?.pokemon_v2_pokemon.map(
          ({ name }) => name
        ) ?? [],
      usedLinks: commonAbilities.map((ability) => ability.name),
      isSameEvoline: isSameEvolutionChain,
    };
  }
  console.log(
    `${pokemonName} is an invalid answer because ${
      commonAbilities.length > 0
        ? "all common abilities are used"
        : "no abilities are shared"
    }`
  );
  return {
    validAnswer: false,
    pokemonName: pokemonFullName,
  };
};
