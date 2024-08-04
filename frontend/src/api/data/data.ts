import axios from "axios";

export default {
  getPokemonNames: async () => {
    const { data } = await axios.get<string[]>("/v1/data/pokemon-names");
    return data;
  },
};
