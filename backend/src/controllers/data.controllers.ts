import { Request, Response } from "express";
import { pokedex, pokemonNames } from "../data/index.js";

export const getPokemonNames = async (req: Request, res: Response) => {
  if (pokemonNames.length > 0) {
    res.json(pokemonNames);
    return;
  }
  const pokemonList = await pokedex.getPokemonsList({
    offset: 0,
    limit: 10000,
  });
  const names = pokemonList.results.map((pokemon) => pokemon.name);
  res.json(names);
};
