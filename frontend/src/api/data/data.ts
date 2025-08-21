import { PokemonNamesResponse, PokemonWithAbilities } from "@pokenerdle/shared";
import axios from "axios";

export default {
  getPokemonNames: async (lastModified?: string | null) => {
    let headers: Record<string, string> | undefined;
    if (lastModified) {
      headers = {
        "if-modified-since": lastModified,
      };
    }

    const response = await axios.get<PokemonNamesResponse[]>(
      "/v1/data/pokemon-names",
      { headers }
    );

    return {
      lastModified: response.headers["last-modified"],
      data: response.data,
    };
  },
  getPokemonIcons: async (lastModified?: string | null) => {
    let headers: Record<string, string> | undefined;
    if (lastModified) {
      headers = {
        "if-modified-since": lastModified,
      };
    }

    const response = await axios.get<Record<number, string | null>>(
      "/v1/data/pokemon-icons",
      { headers }
    );

    return {
      lastModified: response.headers["last-modified"],
      data: response.data,
    };
  },
  getPokemonWithAbilities: async (id: number) => {
    const { data } = await axios.get<PokemonWithAbilities>("/v1/data/pokemon", {
      params: {
        id,
      },
    });
    return data;
  },
};
