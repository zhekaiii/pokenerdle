import api from "@/api";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { useEffect } from "react";
import { useLocalStorage } from "react-use";

export const usePokemonNames = () => {
  const [pokemonNames, setPokemonNames] = useLocalStorage<
    PokemonNamesResponse[]
  >("pokemonNames", []);

  useEffect(() => {
    if (!pokemonNames?.length) api.data.getPokemonNames().then(setPokemonNames);
    (async () => {
      const pokemonNames = await api.data.getPokemonNames();
      setPokemonNames(pokemonNames);
    })();
  }, []);

  return pokemonNames;
};
