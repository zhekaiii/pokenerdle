import { Request, Response } from "express";
import * as dataService from "../services/data.services.js";

export const getPokemonNames = async (req: Request, res: Response) => {
  res.json(await dataService.getPokemonNames());
};

export const getStarterPokemon = async (req: Request, res: Response) => {
  res.json(await dataService.getStarterPokemon());
};

export const validatePokemon = async (req: Request, res: Response) => {
  const { pokemonName, previousPokemonName } = req.body;
  const pokemon = await dataService.validatePokemon(
    pokemonName,
    previousPokemonName
  );
  res.json(pokemon);
};
