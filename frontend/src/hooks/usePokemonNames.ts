import api from "@/api";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import i18n from "i18next";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";

let globalSSRPokemonNames: Record<
  string,
  Record<number, PokemonNamesResponse>
> = {};

export const setSSRPokemonNamesData = (
  data: Record<string, Record<number, PokemonNamesResponse>>,
  lastModified: Record<string, string | null>
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

const lastModifiedAtom = import.meta.env.SSR
  ? atom<Record<string, string | null>>({})
  : atomWithStorage<Record<string, string | null>>(
      "pokemonNamesV2LastModified",
      {},
      undefined,
      {
        getOnInit: true,
      }
    );

export const usePokemonNames = () => {
  const [pokemonNames, setPokemonNames] = useAtom(pokemonNamesAtom);
  const [lastModified, setLastModified] = useAtom(lastModifiedAtom);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Don't fetch in SSR - data is already available from global store
    if (import.meta.env.SSR || !i18n.language) return;

    queryClient
      .fetchQuery({
        queryKey: ["pokemonNames", i18n.language],
        queryFn: () =>
          api.data.getPokemonNames(
            i18n.language!,
            lastModified[i18n.language!]
          ),
      })
      .then(({ data, lastModified }) => {
        setPokemonNames((prev) => ({
          ...prev,
          [i18n.language!]: Object.fromEntries(
            data.map((pokemon) => [pokemon.id, pokemon])
          ),
        }));
        setLastModified((prev) => ({
          ...prev,
          [i18n.language!]: lastModified,
        }));
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 304) {
          return;
        }
        throw error;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to fetch when the language changes
  }, [i18n.language]);

  return i18n.language ? pokemonNames[i18n.language] ?? {} : {};
};
