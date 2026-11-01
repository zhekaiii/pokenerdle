import api from "@/api";
import { MAX_GENERATION, MIN_GENERATION } from "@/lib/constants";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback, useEffect } from "react";
import { usePokemonNames } from "./usePokemonNames";

const pokemonIdsByGenerationAtom = atomWithStorage<Record<number, number[]>>(
  "pokemonIdsByGeneration",
  {},
  undefined,
  {
    getOnInit: true,
  }
);

export const usePokemonIdsByGeneration = () => {
  const [pokemonIdsByGeneration, setPokemonIdsByGeneration] = useAtom(
    pokemonIdsByGenerationAtom
  );

  const fetchPokemonIdsForGeneration = useCallback(
    async (generation: number): Promise<void> => {
      if (generation < MIN_GENERATION || generation > MAX_GENERATION) {
        return;
      }

      const data = await api.data.getPokemonIdsByGeneration(generation);
      setPokemonIdsByGeneration((previous) => ({
        ...previous,
        [generation]: data,
      }));
    },
    [setPokemonIdsByGeneration]
  );

  const getPokemonNamesForGeneration = useCallback(
    (
      pokemonNames: PokemonNamesResponse[],
      generation: number
    ): PokemonNamesResponse[] => {
      const ids = pokemonIdsByGeneration[generation];
      if (!ids) return [];

      return pokemonNames.filter((pokemon) => ids.includes(pokemon.id));
    },
    [pokemonIdsByGeneration]
  );

  return {
    pokemonIdsByGeneration,
    fetchPokemonIdsForGeneration,
    getPokemonNamesForGeneration,
  };
};

export const usePokemonByGeneration = (generation: number) => {
  const { pokemonIdsByGeneration, fetchPokemonIdsForGeneration } =
    usePokemonIdsByGeneration();
  const pokemonNames = usePokemonNames();

  const pokemonForGeneration = pokemonIdsByGeneration[generation]
    ? pokemonIdsByGeneration[generation].reduce((acc, id) => {
        const pokemon = pokemonNames[id];
        if (pokemon) {
          acc.push(pokemon);
        }
        return acc;
      }, [] as PokemonNamesResponse[])
    : [];

  const isLoading =
    !pokemonIdsByGeneration[generation] &&
    generation >= MIN_GENERATION &&
    generation <= MAX_GENERATION;

  useEffect(() => {
    fetchPokemonIdsForGeneration(generation);
  }, [generation, fetchPokemonIdsForGeneration]);

  return {
    pokemon: pokemonForGeneration,
    ids: pokemonIdsByGeneration[generation] || [],
    isLoading,
  };
};
