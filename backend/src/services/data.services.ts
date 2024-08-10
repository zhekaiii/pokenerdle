import Pokedex from "pokedex-promise-v2";
import { redisClient } from "../data/cache.js";

export const pokedex = new Pokedex();

export const getPokemonNames = async () => {
  try {
    const pokemonNamesString = await redisClient.get("pokemonNames");
    const pokemonNames = pokemonNamesString
      ? JSON.parse(pokemonNamesString)
      : null;
    if (pokemonNames) {
      return pokemonNames;
    }
  } catch (error) {
    console.error(error);
  }
  const pokemonList = await pokedex.getPokemonsList({
    offset: 0,
    limit: 10000,
  });
  const names = pokemonList.results
    .filter((pokemon) => !pokemon.name.endsWith("gmax"))
    .map((pokemon) => pokemon.name);
  await redisClient.set("pokemonNames", JSON.stringify(names));
  return names;
};

export const getStarterPokemon = async () => {
  const pokemonNames = await getPokemonNames();
  while (true) {
    const starterIndex = Math.floor(Math.random() * pokemonNames.length);
    const starterPokemon = await pokedex.getPokemonByName(
      pokemonNames[starterIndex]
    );
    // Generate another Pokemon if this one has only one ability
    if (
      starterPokemon.abilities.every(
        ({ ability }) =>
          ability.name == starterPokemon.abilities[0].ability.name
      )
    ) {
      continue;
    }
    return starterPokemon;
  }
};

export const validatePokemon = async (
  pokemonName: string,
  previousPokemonName: string
) => {
  const [pokemon, previousPokemon] = await Promise.all([
    pokedex.getPokemonByName(pokemonName),
    pokedex.getPokemonByName(previousPokemonName),
  ]);
  if (
    previousPokemon.abilities.some(({ ability }) =>
      pokemon.abilities.some((a) => a.ability.name === ability.name)
    )
  ) {
    const pokemonSpecies = await pokedex.getPokemonSpeciesByName(
      pokemon.species.name
    );
    return [
      pokemon,
      pokemonSpecies.varieties.map((variety) => variety.pokemon.name),
    ] as const;
  }
  return pokemon.species.name;
};
