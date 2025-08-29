import api from "@/api";
import { MAX_GENERATION, MIN_GENERATION } from "@/lib/constants";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import axios from "axios";
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

  const fetchPokemonIdsForGeneration = useCallback(
    async (generation: number): Promise<number[]> => {
      if (generation < MIN_GENERATION || generation > MAX_GENERATION) {
        return [];
      }

      const lastModified = lastModifiedByGeneration[generation];
      try {
        const { data, lastModified: newLastModified } =
          await api.data.getPokemonIdsByGeneration(lastModified, generation);
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
        if (axios.isAxiosError(error) && error.response?.status === 304) {
          return pokemonIdsByGeneration[generation];
        }
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
