import api from "@/api";
import { useCallback, useEffect } from "react";
import { useLocalStorage } from "react-use";

export const usePokemonIcons = () => {
  const [pokemonIcons, setPokemonIcons] = useLocalStorage<
    Record<number, string | null>
  >("pokemonIcons", {});
  const [lastModified, setLastModified] = useLocalStorage<string | null>(
    "pokemonIconsLastModified",
    null
  );

  const getPokemonIcon = useCallback(
    (pokemonId: number) =>
      pokemonIcons?.[pokemonId] ??
      `https://raw.githubusercontent.com/pokedextracker/pokesprite/refs/heads/master/images/${pokemonId
        .toString()
        .padStart(3, "0")}.png`,
    [pokemonIcons]
  );

  useEffect(() => {
    api.data.getPokemonIcons(lastModified).then(({ data, lastModified }) => {
      setPokemonIcons(data);
      setLastModified(lastModified);
    });
  }, []);

  return { pokemonIcons, getPokemonIcon };
};
