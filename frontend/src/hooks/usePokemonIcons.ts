import api from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback, useEffect } from "react";

// Global SSR store for Pokemon icons data
let globalSSRPokemonIcons: Record<number, string | null> = {};
let globalSSRLastModified: string | null = null;

// Function to set global SSR data (called once at startup)
export const setSSRPokemonIconsData = (
  data: Record<number, string | null>,
  lastModified: string | null,
) => {
  globalSSRPokemonIcons = data;
  globalSSRLastModified = lastModified;
};

// Create atoms that use SSR data when available
const pokemonIconsAtom = import.meta.env.SSR
  ? atom(
      () => globalSSRPokemonIcons,
      // In SSR, we don't need to set the value and this removes typescript errors
      // since it's no longer a ReadonlyAtom
      () => {},
    )
  : atomWithStorage<Record<number, string | null>>(
      "pokemonIcons",
      {},
      undefined,
      {
        getOnInit: true,
      },
    );

const lastModifiedAtom = import.meta.env.SSR
  ? atom<string | null>(globalSSRLastModified)
  : atomWithStorage<string | null>(
      "pokemonIconsLastModified",
      null,
      undefined,
      {
        getOnInit: true,
      },
    );

export const usePokemonIcons = () => {
  const [pokemonIcons, setPokemonIcons] = useAtom(pokemonIconsAtom);
  const [lastModified, setLastModified] = useAtom(lastModifiedAtom);

  const queryClient = useQueryClient();

  const getPokemonIcon = useCallback(
    (pokemonId: number) => {
      if (pokemonIcons?.[pokemonId]) {
        // TEMP FIX because master branch is weird
        if (pokemonIcons[pokemonId].includes("sprites/master/sprites")) {
          return pokemonIcons[pokemonId].replace(
            "sprites/master/sprites",
            "sprites/4bcd17051efacd74966305ac87a0330b6131259a/sprites",
          );
        }
        return pokemonIcons[pokemonId];
      }
      return `https://raw.githubusercontent.com/pokedextracker/pokesprite/refs/heads/master/images/${pokemonId
        .toString()
        .padStart(3, "0")}.png`;
    },
    [pokemonIcons],
  );

  useEffect(() => {
    // Don't fetch in SSR - data is already available from global store
    if (import.meta.env.SSR) return;

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
