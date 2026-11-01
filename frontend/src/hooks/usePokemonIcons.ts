import api from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback, useEffect } from "react";

// Global SSR store for Pokemon icons data
let globalSSRPokemonIcons: Record<number, string | null> = {};

// Function to set global SSR data (called once at startup)
export const setSSRPokemonIconsData = (data: Record<number, string | null>) => {
  globalSSRPokemonIcons = data;
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

export const usePokemonIcons = () => {
  const [pokemonIcons, setPokemonIcons] = useAtom(pokemonIconsAtom);

  const queryClient = useQueryClient();

  const getPokemonIcon = useCallback(
    (pokemonId: number) => {
      if (pokemonIcons?.[pokemonId]) {
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
        queryFn: () => api.data.getPokemonIcons(),
      })
      .then((data) => {
        setPokemonIcons(data);
      });
  }, [queryClient, setPokemonIcons]);

  return { pokemonIcons, getPokemonIcon };
};
