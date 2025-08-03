import { PokemonNamesResponse, PokemonWithAbilities } from "@pokenerdle/shared";
import axios from "axios";

export default {
  getPokemonNames: async () => {
    const { data } = await axios.get<PokemonNamesResponse[]>(
      "/v1/data/pokemon-names"
    );
    return data;
  },
  getPokemonIcons: async () => {
    const { data } = await axios.get<Record<number, string | null>>(
      "/v1/data/pokemon-icons"
    );
    return data;
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
