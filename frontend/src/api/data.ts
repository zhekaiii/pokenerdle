import axios from "axios";
import { Pokemon } from "pokeapi-js-wrapper";

export default {
  getPokemonNames: async () => {
    const { data } = await axios.get<string[]>("/v1/data/pokemon-names");
    return data;
  },
  getStarterPokemon: async () => {
    const { data } = await axios.get<Pokemon>("/v1/data/starter-pokemon");
    return data;
  },
  validatePokemon: async (pokemonName: string, previousPokemonName: string) => {
    const { data } = await axios.post<Pokemon | null>(
      "/v1/data/validate-pokemon",
      {
        pokemonName,
        previousPokemonName,
      }
    );
    return data;
  },
};
