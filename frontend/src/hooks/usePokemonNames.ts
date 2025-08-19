import api from "@/api";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";

const pokemonNamesAtom = atomWithStorage<PokemonNamesResponse[]>(
  "pokemonNames",
  []
);

const lastModifiedAtom = atomWithStorage<string | null>(
  "pokemonNamesLastModified",
  null
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
