import api from "@/api";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { useEffect } from "react";
import { useLocalStorage } from "react-use";

export const usePokemonNames = () => {
  const [pokemonNames, setPokemonNames] = useLocalStorage<
    PokemonNamesResponse[]
  >("pokemonNames", []);

  useEffect(() => {
    if (pokemonNames?.length) return;
    api.data.getPokemonNames().then(setPokemonNames);
  }, []);

  return pokemonNames;
};
