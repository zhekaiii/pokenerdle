import api from "@/api";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";

const pokemonNamesAtom = atomWithStorage<PokemonNamesResponse[]>(
  "pokemonNames",
  []
);

export const usePokemonNames = () => {
  const [pokemonNames, setPokemonNames] = useAtom(pokemonNamesAtom);

  useEffect(() => {
    if (pokemonNames?.length) return;
    api.data.getPokemonNames().then(setPokemonNames);
  }, []);

  return pokemonNames;
};
