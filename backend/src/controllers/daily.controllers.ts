import { DailyChallengeGuessRequestSchema } from "@pokenerdle/shared/daily";
import { Request, Response } from "express";
import * as z from "zod";
import { StatusCode } from "../data/const.js";
import { verifyGuess } from "../services/daily.service.js";

export const verifyDailyPokemonGuessController = async (
  req: Request,
  res: Response
) => {
  const parsed = DailyChallengeGuessRequestSchema.safeParse(req.body);
  if (parsed.error) {
    res.status(StatusCode.BAD_REQUEST).json(z.treeifyError(parsed.error));
    return;
  }
  const { pokemon_id, date } = parsed.data;
  const results = await verifyGuess(pokemon_id, date);
  res.json(results);
};
