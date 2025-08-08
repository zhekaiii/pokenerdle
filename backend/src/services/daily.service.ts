import { formatDate } from "date-fns";
import { alea } from "seedrandom";
import {
  getNumPokemon,
  getPokemonWithAbilities,
} from "../repositories/pokemon.repository.js";

export const getDailyPokemon = async () => {
  const rng = alea(
    process.env.RANDOM_SEED! + formatDate(new Date(), "yyyy-MM-dd")
  );
  const numPokemon = await getNumPokemon();
  const randomIndex = Math.floor(rng() * numPokemon);
  return await getPokemonWithAbilities({ offset: randomIndex });
};
