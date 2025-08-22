import { Request, Response } from "express";
import { MAX_GENERATION, MIN_GENERATION } from "../constants/game.js";
import { StatusCode } from "../data/const.js";
import * as dataService from "../services/data.services.js";

const POKEMON_NAMES_LAST_UPDATED = new Date("2025-08-19").toUTCString();
export const getPokemonNames = async (req: Request, res: Response) => {
  const ifModifiedSince = req.headers["if-modified-since"];
  if (ifModifiedSince && ifModifiedSince === POKEMON_NAMES_LAST_UPDATED) {
    res.status(304).end();
    return;
  }

  res.setHeader("last-modified", POKEMON_NAMES_LAST_UPDATED);
  const data = await dataService.getPokemonNames();
  res.json(data);
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

const POKEMON_GENERATIONS_LAST_UPDATED = new Date("2025-08-19").toUTCString();
export const getPokemonIdsByGeneration = async (
  req: Request,
  res: Response
) => {
  const ifModifiedSince = req.headers["if-modified-since"];
  if (ifModifiedSince && ifModifiedSince === POKEMON_GENERATIONS_LAST_UPDATED) {
    res.status(304).end();
    return;
  }

  if (!req.query.generation) {
    res
      .status(StatusCode.BAD_REQUEST)
      .send("Missing generation query parameter.");
    return;
  }

  const generation = Number(req.query.generation);
  if (
    isNaN(generation) ||
    generation < MIN_GENERATION ||
    generation > MAX_GENERATION
  ) {
    res
      .status(StatusCode.BAD_REQUEST)
      .send(
        `Invalid generation. Must be between ${MIN_GENERATION} and ${MAX_GENERATION}.`
      );
    return;
  }

  res.setHeader("last-modified", POKEMON_GENERATIONS_LAST_UPDATED);
  const data = await dataService.getPokemonIdsByGeneration(generation);
  res.json(data);
};
