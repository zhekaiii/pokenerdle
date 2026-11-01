import type { Request, RequestHandler } from "express";
import { MAX_GENERATION, MIN_GENERATION } from "../constants/game.js";
import { StatusCode } from "../data/const.js";
import { getLanguageId } from "../utils/lang.js";

// Bump the relevant date whenever that resource's representation changes.
const POKEMON_NAMES_LAST_UPDATED = new Date("2026-10-31").toUTCString();
const POKEMON_ICONS_LAST_UPDATED = new Date(
  "2026-10-31T10:51:33Z",
).toUTCString();
const POKEMON_GENERATIONS_LAST_UPDATED = new Date("2026-10-31").toUTCString();

const conditionalCache = (
  lastModified: string,
  getRepresentation: (req: Request) => string,
): RequestHandler => (req, res, next) => {
  res.set({
    "Cache-Control": "private, no-cache",
    "Last-Modified": lastModified,
    ETag: `W/"${getRepresentation(req)}-${Date.parse(lastModified)}"`,
  });

  // Express applies If-None-Match precedence and parses If-Modified-Since dates.
  if (req.fresh) {
    res.status(304).end();
    return;
  }
  next();
};

export const cachePokemonNames = conditionalCache(
  POKEMON_NAMES_LAST_UPDATED,
  (req) => `pokemon-names-${getLanguageId(String(req.query.lang ?? "en"))}`,
);

export const cachePokemonIcons = conditionalCache(
  POKEMON_ICONS_LAST_UPDATED,
  () => "pokemon-icons",
);

export const cachePokemonGenerations = conditionalCache(
  POKEMON_GENERATIONS_LAST_UPDATED,
  (req) => `pokemon-generations-${Number(req.query.generation)}`,
);

export const validatePokemonGeneration: RequestHandler = (req, res, next) => {
  if (!req.query.generation) {
    res
      .status(StatusCode.BAD_REQUEST)
      .send("Missing generation query parameter.");
    return;
  }

  const generation = Number(req.query.generation);
  if (
    !Number.isInteger(generation) ||
    generation < MIN_GENERATION ||
    generation > MAX_GENERATION
  ) {
    res
      .status(StatusCode.BAD_REQUEST)
      .send(
        `Invalid generation. Must be between ${MIN_GENERATION} and ${MAX_GENERATION}.`,
      );
    return;
  }

  next();
};
