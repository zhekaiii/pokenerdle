import {
  PokemonIdsByGenerationResponse,
  PokemonNamesResponse,
  PokemonWithAbilities,
} from "@pokenerdle/shared";
import { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  getPokemonNames: async (lang: string) => {
    const { data } = await axiosInstance.get<PokemonNamesResponse[]>(
      "/v1/data/pokemon-names",
      { params: { lang } },
    );
    return data;
  },
  getPokemonIcons: async () => {
    const { data } = await axiosInstance.get<Record<number, string | null>>(
      "/v1/data/pokemon-icons",
    );
    return data;
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
  getPokemonIdsByGeneration: async (generation: number) => {
    const { data } = await axiosInstance.get<PokemonIdsByGenerationResponse>(
      "/v1/data/pokemon-generations",
      { params: { generation } },
    );
    return data;
  },
});
