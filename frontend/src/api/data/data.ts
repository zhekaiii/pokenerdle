import { PokemonNamesResponse, PokemonWithAbilities } from "@pokenerdle/shared";
import axios from "axios";

export default {
  getPokemonNames: async (lastModified?: string | null) => {
    const headers: Record<string, string> = {};
    if (lastModified) {
      headers["if-modified-since"] = lastModified;
    }

    const response = await axios.get<PokemonNamesResponse[]>(
      "/v1/data/pokemon-names",
      { headers: axios.defaults.headers.get, ...headers }
    );

    return {
      lastModified: response.headers["last-modified"],
      data: response.data,
    };
  },
  getPokemonIcons: async (lastModified?: string | null) => {
    const headers: Record<string, string> = {};
    if (lastModified) {
      headers["if-modified-since"] = lastModified;
    }

    const response = await axios.get<Record<number, string | null>>(
      "/v1/data/pokemon-icons",
      { headers: axios.defaults.headers.get, ...headers }
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
