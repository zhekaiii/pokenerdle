import { Request, Response } from "express";
import { StatusCode } from "../data/const.js";
import * as dataService from "../services/data.services.js";

export const getPokemonNames = async (req: Request, res: Response) => {
  res.json(await dataService.getPokemonNames());
};

const POKEMON_ICONS_LAST_UPDATED = new Date("2025-08-17").toUTCString();
export const getPokemonIcons = async (req: Request, res: Response) => {
  const ifModifiedSince = req.headers["if-modified-since"];
  if (ifModifiedSince && ifModifiedSince === POKEMON_ICONS_LAST_UPDATED) {
    res.status(304).end();
    return;
  }

  res.setHeader("last-modified", POKEMON_ICONS_LAST_UPDATED);
  const data = await dataService.getPokemonIcons();
  res.json(data);
};

export const getPokemonWithAbilities = async (req: Request, res: Response) => {
  if (!req.query.id) {
    res.status(StatusCode.BAD_REQUEST).send("Missing id query parameter.");
    return;
  }
  const id = Number(req.query.id);
  res.json(await dataService.getPokemonWithAbilities(id));
};
