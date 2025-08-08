import api from "@/api";
import { useEffect } from "react";
import { useLocalStorage } from "react-use";

export const usePokemonIcons = () => {
  const [pokemonIcons, setPokemonIcons] = useLocalStorage<
    Record<number, string | null>
  >("pokemonIcons", {});

  useEffect(() => {
    if (!pokemonIcons || !pokemonIcons[1])
      api.data.getPokemonIcons().then(setPokemonIcons);
  }, [pokemonIcons]);

  return pokemonIcons;
};
