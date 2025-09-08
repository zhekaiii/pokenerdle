import {
  PokemonIdsByGenerationResponse,
  PokemonNamesResponse,
  PokemonWithAbilities,
} from "@pokenerdle/shared";
import { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  getPokemonNames: async (lang: string, lastModified?: string | null) => {
    let headers: Record<string, string> | undefined;
    if (lastModified) {
      headers = {
        "if-modified-since": lastModified,
      };
    }

    const response = await axiosInstance.get<PokemonNamesResponse[]>(
      "/v1/data/pokemon-names",
      { headers, params: { lang } }
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

    const response = await axiosInstance.get<Record<number, string | null>>(
      "/v1/data/pokemon-icons",
      { headers }
    );

    return {
      lastModified: response.headers["last-modified"],
      data: response.data,
    };
  },
  getPokemonWithAbilities: async (id: number) => {
    const { data } = await axiosInstance.get<PokemonWithAbilities>(
      "/v1/data/pokemon",
      {
        params: {
          id,
        },
      }
    );
    return data;
  },
  getPokemonIdsByGeneration: async (
    lastModified: string | null,
    generation: number
  ) => {
    let headers: Record<string, string> | undefined;
    if (lastModified) {
      headers = {
        "if-modified-since": lastModified,
      };
    }

    const response = await axiosInstance.get<PokemonIdsByGenerationResponse>(
      "/v1/data/pokemon-generations",
      {
        headers,
        params: { generation },
      }
    );

    return {
      lastModified: response.headers["last-modified"],
      data: response.data,
    };
  },
});
