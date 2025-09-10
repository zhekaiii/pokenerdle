import { createApi } from "@/api";
import { setSSRPokemonIconsData } from "@/hooks/usePokemonIcons";
import { setSSRPokemonNamesData } from "@/hooks/usePokemonNames";
import { PokemonNamesResponse } from "@pokenerdle/shared";

// Supported languages for Pokemon names
const SUPPORTED_LANGUAGES = ["en", "zh-Hans", "zh-Hant"];

/**
 * Fetches Pokemon icons and names data for SSR and caches it globally.
 * This should be called once at server startup.
 */
export const initializeSSRData = async () => {
  try {
    const api = createApi();

    const [iconsResult, ...namesResults] = await Promise.allSettled([
      api.data.getPokemonIcons(),
      ...SUPPORTED_LANGUAGES.map((lang) =>
        api.data.getPokemonNames(lang).then((result) => ({ lang, ...result }))
      ),
    ]);

    if (iconsResult.status === "fulfilled") {
      const { data: iconsData, lastModified: iconsLastModified } =
        iconsResult.value;
      setSSRPokemonIconsData(iconsData, iconsLastModified);
    } else {
      console.warn("Failed to load Pokemon icons:", iconsResult.reason);
    }

    const pokemonNamesData: Record<
      string,
      Record<number, PokemonNamesResponse>
    > = {};
    const pokemonNamesLastModified: Record<string, string | null> = {};

    namesResults.forEach((result, index) => {
      const lang = SUPPORTED_LANGUAGES[index];
      if (result.status === "fulfilled") {
        const { data, lastModified } = result.value;
        pokemonNamesData[lang] = Object.fromEntries(
          data.map((pokemon) => [pokemon.id, pokemon])
        );
        pokemonNamesLastModified[lang] = lastModified;
      } else {
        console.warn(
          `Failed to load Pokemon names for language ${lang}:`,
          result.reason
        );
      }
    });

    setSSRPokemonNamesData(pokemonNamesData, pokemonNamesLastModified);
  } catch (error) {
    console.warn("Failed to initialize SSR Pokemon data:", error);
  }
};
