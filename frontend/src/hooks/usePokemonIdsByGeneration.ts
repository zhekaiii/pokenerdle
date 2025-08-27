import api from "@/api";
import { MAX_GENERATION, MIN_GENERATION } from "@/lib/constants";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback } from "react";
import { usePokemonNames } from "./usePokemonNames";

const pokemonIdsByGenerationAtom = atomWithStorage<Record<number, number[]>>(
  "pokemonIdsByGeneration",
  {},
  undefined,
  {
    getOnInit: true,
  }
);
const lastModifiedByGenerationAtom = atomWithStorage<
  Record<number, string | null>
>("pokemonIdsByGenerationLastModified", {}, undefined, {
  getOnInit: true,
});

export const usePokemonIdsByGeneration = () => {
  const [pokemonIdsByGeneration, setPokemonIdsByGeneration] = useAtom(
    pokemonIdsByGenerationAtom
  );
  const [lastModifiedByGeneration, setLastModifiedByGeneration] = useAtom(
    lastModifiedByGenerationAtom
  );

  const getPokemonIdsForGeneration = useCallback(
    async (generation: number): Promise<number[]> => {
      if (generation < MIN_GENERATION || generation > MAX_GENERATION) {
        return [];
      }

      // Return cached data if available
      if (pokemonIdsByGeneration[generation]) {
        return pokemonIdsByGeneration[generation];
      }

      // Fetch data for this generation
      try {
        // FIXME: Axios throws an error if 304 is returned
        // const lastModified = lastModifiedByGeneration[generation];
        const { data, lastModified: newLastModified } =
          await api.data.getPokemonIdsByGeneration(null, generation);

        // Update cache
        const updatedIds = { ...pokemonIdsByGeneration, [generation]: data };
        const updatedLastModified = {
          ...lastModifiedByGeneration,
          [generation]: newLastModified,
        };

        setPokemonIdsByGeneration(updatedIds);
        setLastModifiedByGeneration(updatedLastModified);

        return data;
      } catch (error) {
        console.error(
          `Failed to fetch Pokemon IDs for generation ${generation}:`,
          error
        );
        return [];
      }
    },
    [
      pokemonIdsByGeneration,
      lastModifiedByGeneration,
      setPokemonIdsByGeneration,
      setLastModifiedByGeneration,
    ]
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
    getPokemonIdsForGeneration,
    getPokemonNamesForGeneration,
  };
};

export const usePokemonByGeneration = (generation: number) => {
  const { pokemonIdsByGeneration, getPokemonIdsForGeneration } =
    usePokemonIdsByGeneration();
  const pokemonNames = usePokemonNames();

  const pokemonForGeneration = pokemonIdsByGeneration[generation]
    ? pokemonIdsByGeneration[generation]
        .map((id) => pokemonNames[id])
        .filter(Boolean)
    : [];

  const isLoading =
    !pokemonIdsByGeneration[generation] &&
    generation >= MIN_GENERATION &&
    generation <= MAX_GENERATION;

  return {
    pokemon: pokemonForGeneration,
    ids: pokemonIdsByGeneration[generation] || [],
    isLoading,
    fetch: () => getPokemonIdsForGeneration(generation),
  };
};
