import {
  StatGuessRoundQuerySchema,
  StatGuessScope,
} from "@pokenerdle/shared";
import { Request, Response } from "express";
import { StatusCode } from "../data/const.js";
import {
  InvalidFormatError,
  NoMatchingPokemonError,
  getFormats,
  getRound,
} from "../services/statGuesser.service.js";

export const getFormatsController = async (_req: Request, res: Response) => {
  const data = await getFormats();
  res.set("Cache-Control", "public, max-age=3600");
  res.json(data);
};

export const getRoundController = async (req: Request, res: Response) => {
  const parsed = StatGuessRoundQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res
      .status(StatusCode.BAD_REQUEST)
      .json({ error: "invalid_query", details: parsed.error.issues });
    return;
  }
  const { format, gen, excludeIds } = parsed.data;

  const scope: StatGuessScope = format
    ? { kind: "format", formatId: format }
    : gen
      ? { kind: "generations", generations: gen }
      : { kind: "all" };

  try {
    const data = await getRound({ scope, excludeIds: excludeIds ?? [] });
    res.json(data);
  } catch (err) {
    if (err instanceof InvalidFormatError) {
      res.status(StatusCode.BAD_REQUEST).json({ error: "invalid_format" });
      return;
    }
    if (err instanceof NoMatchingPokemonError) {
      res
        .status(StatusCode.NOT_FOUND)
        .json({ error: "no_pokemon_match_filter" });
      return;
    }
    throw err;
  }
};
