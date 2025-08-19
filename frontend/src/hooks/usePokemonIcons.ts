import api from "@/api";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback, useEffect } from "react";

const pokemonIconsAtom = atomWithStorage<Record<number, string | null>>(
  "pokemonIcons",
  {}
);
const lastModifiedAtom = atomWithStorage<string | null>(
  "pokemonIconsLastModified",
  null
);

export const usePokemonIcons = () => {
  const [pokemonIcons, setPokemonIcons] = useAtom(pokemonIconsAtom);
  const [lastModified, setLastModified] = useAtom(lastModifiedAtom);

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
