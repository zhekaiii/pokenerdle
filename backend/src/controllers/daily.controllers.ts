import { DailyChallengeSubmitGuessRequestSchema } from "@pokenerdle/shared/daily";
import { Request, Response } from "express";
import * as z from "zod";
import { StatusCode } from "../data/const.js";
import {
  getDailyPokemonAnswer,
  getUserGuessesForDateService,
  submitGuess,
} from "../services/daily.service.js";

export const submitDailyPokemonGuessController = async (
  req: Request,
  res: Response
) => {
  const parsed = DailyChallengeSubmitGuessRequestSchema.safeParse(req.body);
  if (parsed.error) {
    res.status(StatusCode.BAD_REQUEST).json(z.treeifyError(parsed.error));
    return;
  }
  const { pokemon_id, date, user_id } = parsed.data;

  try {
    const results = await submitGuess(user_id, pokemon_id, date);
    res.json(results);
  } catch (error) {
    console.error("Error submitting guess:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to submit guess",
    });
  }
};

export const getUserGuessesController = async (req: Request, res: Response) => {
  const { user_id, date } = req.query;

  if (!user_id || typeof user_id !== "string") {
    res.status(StatusCode.BAD_REQUEST).json({
      error: "User ID parameter is required",
    });
    return;
  }

  if (!date || typeof date !== "string") {
    res.status(StatusCode.BAD_REQUEST).json({
      error: "Date parameter is required",
    });
    return;
  }

  try {
    const guesses = await getUserGuessesForDateService(user_id, date);
    res.json(guesses);
  } catch (error) {
    console.error("Error getting user guesses:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to get user guesses",
    });
  }
};

export const getDailyPokemonAnswerController = async (
  req: Request,
  res: Response
) => {
  const { date } = req.query;
  if (!date || typeof date !== "string") {
    res
      .status(StatusCode.BAD_REQUEST)
      .json({ error: "Date parameter is required" });
    return;
  }

  try {
    const answer = await getDailyPokemonAnswer(date);
    res.json(answer);
  } catch (error) {
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to get answer" });
  }
};
