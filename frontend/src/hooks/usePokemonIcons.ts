import api from "@/api";
import { useCallback, useEffect } from "react";
import { useLocalStorage } from "react-use";

export const usePokemonIcons = () => {
  const [pokemonIcons, setPokemonIcons] = useLocalStorage<
    Record<number, string | null>
  >("pokemonIcons", {});

  const getPokemonIcon = useCallback(
    (pokemonId: number) =>
      pokemonIcons?.[pokemonId] ??
      `https://raw.githubusercontent.com/pokedextracker/pokesprite/refs/heads/master/images/${pokemonId}.png`,
    []
  );

  useEffect(() => {
    if (!pokemonIcons || !pokemonIcons[1])
      api.data.getPokemonIcons().then(setPokemonIcons);
  }, [pokemonIcons]);

  return { pokemonIcons, getPokemonIcon };
};
