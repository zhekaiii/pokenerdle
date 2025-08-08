import { Request, Response } from "express";
import { StatusCode } from "../data/const.js";
import * as dataService from "../services/data.services.js";

export const getPokemonNames = async (req: Request, res: Response) => {
  res.json(await dataService.getPokemonNames());
};

export const getPokemonIcons = async (req: Request, res: Response) => {
  res.json(await dataService.getPokemonIcons());
};

export const getPokemonWithAbilities = async (req: Request, res: Response) => {
  if (!req.query.id) {
    res.status(StatusCode.BAD_REQUEST).send("Missing id query parameter.");
    return;
  }
  const id = Number(req.query.id);
  res.json(await dataService.getPokemonWithAbilities({ id }));
};
