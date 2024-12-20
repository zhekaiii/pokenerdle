import { Request, Response } from "express";
import * as dataService from "../services/data.services.js";

export const getPokemonNames = async (req: Request, res: Response) => {
  res.json(await dataService.getPokemonNames());
};
