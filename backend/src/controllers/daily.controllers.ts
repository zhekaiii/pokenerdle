import {
  DailyChallengeSubmitGuessRequestSchema,
  DailyChallengeSyncGuessesRequestSchema,
} from "@pokenerdle/shared/daily";
import { Request, Response } from "express";
import * as z from "zod";
import { StatusCode } from "../data/const.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import {
  getDailyPokemonAnswer,
  getUserGuessesForDateService,
  getUserStats,
  submitGuess,
  syncUserGuesses,
} from "../services/daily.service.js";

export const submitDailyPokemonGuessController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = DailyChallengeSubmitGuessRequestSchema.safeParse(req.body);
  if (parsed.error) {
    res.status(StatusCode.BAD_REQUEST).json(z.treeifyError(parsed.error));
    return;
  }
  const { pokemon_id, date } = parsed.data;
  const userId = req.user?.id;

  try {
    const results = await submitGuess(userId, pokemon_id, date);
    res.json(results);
  } catch (error) {
    console.error("Error submitting guess:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to submit guess",
    });
  }
};

export const getUserGuessesController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { date } = req.query;
  const user_id = req.user!.id; // User is guaranteed to exist due to middleware

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
    console.error("Error getting daily pokemon answer:", error);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to get answer" });
  }
};

export const syncUserGuessesController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = DailyChallengeSyncGuessesRequestSchema.safeParse(req.body);
  if (parsed.error) {
    res.status(StatusCode.BAD_REQUEST).json(z.treeifyError(parsed.error));
    return;
  }

  const { guesses, date } = parsed.data;
  const user_id = req.user!.id; // User is guaranteed to exist due to middleware

  try {
    const results = await syncUserGuesses(user_id, guesses, date);
    res.json(results);
  } catch (error) {
    console.error("Error syncing user guesses:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to sync user guesses",
    });
  }
};

export const getUserStatsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user!.id;

  try {
    const stats = await getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to get user stats",
    });
  }
};
