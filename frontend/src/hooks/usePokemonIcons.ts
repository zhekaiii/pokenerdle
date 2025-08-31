import api from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback, useEffect } from "react";

const pokemonIconsAtom = atomWithStorage<Record<number, string | null>>(
  "pokemonIcons",
  {},
  undefined,
  {
    getOnInit: true,
  }
);
const lastModifiedAtom = atomWithStorage<string | null>(
  "pokemonIconsLastModified",
  null,
  undefined,
  {
    getOnInit: true,
  }
);

export const usePokemonIcons = () => {
  const [pokemonIcons, setPokemonIcons] = useAtom(pokemonIconsAtom);
  const [lastModified, setLastModified] = useAtom(lastModifiedAtom);

  const queryClient = useQueryClient();

  const getPokemonIcon = useCallback(
    (pokemonId: number) =>
      pokemonIcons?.[pokemonId] ??
      `https://raw.githubusercontent.com/pokedextracker/pokesprite/refs/heads/master/images/${pokemonId
        .toString()
        .padStart(3, "0")}.png`,
    [pokemonIcons]
  );

  useEffect(() => {
    queryClient
      .fetchQuery({
        queryKey: ["pokemonIcons"],
        queryFn: () => api.data.getPokemonIcons(lastModified),
      })
      .then(({ data, lastModified }) => {
        setPokemonIcons(data);
        setLastModified(lastModified);
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 304) {
          return;
        }
        throw error;
      });
  }, []);

  return { pokemonIcons, getPokemonIcon };
};
