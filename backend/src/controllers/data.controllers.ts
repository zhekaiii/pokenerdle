import { Request, Response } from "express";
import { StatusCode } from "../data/const.js";
import * as dataService from "../services/data.services.js";
import { getLanguageId } from "../utils/lang.js";

export const getPokemonNames = async (req: Request, res: Response) => {
  const languageId = getLanguageId(String(req.query.lang ?? "en"));
  res.json(await dataService.getPokemonNames(languageId));
};

export const getPokemonIcons = async (_req: Request, res: Response) => {
  res.json(await dataService.getPokemonIcons());
};

export const getPokemonWithAbilities = async (req: Request, res: Response) => {
  if (!req.query.id) {
    res.status(StatusCode.BAD_REQUEST).send("Missing id query parameter.");
    return;
  }
  const id = Number(req.query.id);
  res.json(await dataService.getPokemonWithAbilities(id));
};

export const getPokemonIdsByGeneration = async (
  req: Request,
  res: Response,
) => {
  res.json(await dataService.getPokemonIdsByGeneration(Number(req.query.generation)));
};
