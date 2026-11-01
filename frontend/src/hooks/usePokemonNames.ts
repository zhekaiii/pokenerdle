import api from "@/api";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

let globalSSRPokemonNames: Record<
  string,
  Record<number, PokemonNamesResponse>
> = {};

export const setSSRPokemonNamesData = (
  data: Record<string, Record<number, PokemonNamesResponse>>
) => {
  globalSSRPokemonNames = data;
};

const pokemonNamesAtom = import.meta.env.SSR
  ? atom(
      () => globalSSRPokemonNames,
      // In SSR, we don't need to set the value and this removes typescript errors
      // since it's no longer a ReadonlyAtom
      () => {}
    )
  : atomWithStorage<Record<string, Record<number, PokemonNamesResponse>>>(
      "pokemonNamesV2",
      {},
      undefined,
      {
        getOnInit: true,
      }
    );

export const usePokemonNames = () => {
  const [pokemonNames, setPokemonNames] = useAtom(pokemonNamesAtom);
  const queryClient = useQueryClient();
  const {
    i18n: { language },
  } = useTranslation();

  useEffect(() => {
    // Don't fetch in SSR - data is already available from global store
    if (import.meta.env.SSR || !language) return;

    queryClient
      .fetchQuery({
        queryKey: ["pokemonNames", language],
        queryFn: () => api.data.getPokemonNames(language),
      })
      .then((data) => {
        setPokemonNames((prev) => ({
          ...prev,
          [language]: Object.fromEntries(
            data.map((pokemon) => [pokemon.id, pokemon])
          ),
        }));
      });
  }, [language, queryClient, setPokemonNames]);

  return language ? pokemonNames[language] ?? {} : {};
};
