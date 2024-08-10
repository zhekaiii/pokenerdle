import Pokedex from "pokedex-promise-v2";
import { MAX_LINKS } from "../controllers/types.js";
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
  previousPokemonName: string,
  usedLinks: Record<string, number>
) => {
  const [pokemon, previousPokemon] = await Promise.all([
    pokedex.getPokemonByName(pokemonName),
    pokedex.getPokemonByName(previousPokemonName),
  ]);
  const commonAbilities = pokemon.abilities.filter(({ ability }) =>
    previousPokemon.abilities.some((a) => a.ability.name === ability.name)
  );
  if (
    commonAbilities.length > 0 &&
    commonAbilities.every(
      ({ ability }) => (usedLinks[ability.name] ?? 0) < MAX_LINKS
    )
  ) {
    commonAbilities.forEach(({ ability }) => {
      usedLinks[ability.name] = Math.min(
        (usedLinks[ability.name] ?? 0) + 1,
        MAX_LINKS
      );
    });
    const pokemonSpecies = await pokedex.getPokemonSpeciesByName(
      pokemon.species.name
    );
    console.log(`${pokemonName} is a valid answer`);
    return [
      pokemon,
      pokemonSpecies.varieties.map((variety) => variety.pokemon.name),
    ] as const;
  }
  console.log(
    `${pokemonName} is an invalid answer because ${
      commonAbilities.length > 0
        ? "all common abilities are used"
        : "no abilities are shared"
    }`
  );
  return pokemon.species.name;
};
