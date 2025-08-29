import api from "@/api";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

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
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!i18n.resolvedLanguage) return;
    queryClient
      .fetchQuery({
        queryKey: ["pokemonNames", i18n.resolvedLanguage],
        queryFn: () =>
          api.data.getPokemonNames(
            i18n.resolvedLanguage!,
            lastModified[i18n.resolvedLanguage!]
          ),
      })
      .then(({ data, lastModified }) => {
        setPokemonNames((prev) => ({
          ...prev,
          [i18n.resolvedLanguage!]: Object.fromEntries(
            data.map((pokemon) => [pokemon.id, pokemon])
          ),
        }));
        setLastModified((prev) => ({
          ...prev,
          [i18n.resolvedLanguage!]: lastModified,
        }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to fetch when the language changes
  }, [i18n.resolvedLanguage]);

  return i18n.resolvedLanguage ? pokemonNames[i18n.resolvedLanguage] ?? {} : {};
};
