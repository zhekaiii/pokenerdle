import { MIN_PATHFINDER_LENGTH } from "../constants/game.js";
import * as pokemonRepository from "../repositories/pokemon.repository.js";

export const getRandomPathWithStartEndPokemon = async () => {
  let selectedPath;
  do {
    selectedPath = pokemonRepository.getRandomPokemonPath();
  } while (selectedPath.length < MIN_PATHFINDER_LENGTH);
  const startPokemonId = selectedPath[0];
  const endPokemonId = selectedPath[selectedPath.length - 1];
  const [startPokemon, endPokemon] = await Promise.all([
    pokemonRepository.getPokemonWithAbilities(startPokemonId),
    pokemonRepository.getPokemonWithAbilities(endPokemonId),
  ]);

  if (!startPokemon || !endPokemon) {
    throw new Error("Could not retrieve start or end Pokemon.");
  }

  return {
    startPokemon,
    endPokemon,
    pathLength: selectedPath.length,
  };
};
