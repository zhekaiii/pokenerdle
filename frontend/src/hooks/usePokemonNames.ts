import api from "@/api";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";

const pokemonNamesAtom = atomWithStorage<PokemonNamesResponse[]>(
  "pokemonNames",
  [],
  undefined,
  {
    getOnInit: true,
  }
);

export const pokemonNamesByIdAtom = atom((get) => {
  const pokemonNames = get(pokemonNamesAtom);
  return pokemonNames.reduce((acc, pokemon) => {
    acc[pokemon.id] = pokemon;
    return acc;
  }, {} as Record<number, PokemonNamesResponse>);
});

const lastModifiedAtom = atomWithStorage<string | null>(
  "pokemonNamesLastModified",
  null,
  undefined,
  {
    getOnInit: true,
  }
);

export const usePokemonNames = () => {
  const [pokemonNames, setPokemonNames] = useAtom(pokemonNamesAtom);
  const [lastModified, setLastModified] = useAtom(lastModifiedAtom);
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient
      .fetchQuery({
        queryKey: ["pokemonNames"],
        queryFn: () => api.data.getPokemonNames(lastModified),
      })
      .then(({ data, lastModified }) => {
        setPokemonNames(data);
        setLastModified(lastModified);
      });
  }, []);

  return pokemonNames;
};
