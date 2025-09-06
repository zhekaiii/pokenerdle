import api from "@/api";
import i18n from "@/lib/i18n";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";

const pokemonNamesAtom = atomWithStorage<
  Record<string, Record<number, PokemonNamesResponse>>
>("pokemonNamesV2", {}, undefined, {
  getOnInit: true,
});

const lastModifiedAtom = atomWithStorage<Record<string, string | null>>(
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
    if (!i18n.language) return;
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
