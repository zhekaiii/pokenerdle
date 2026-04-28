import {
  DailyChallengeCalendarRequestSchema,
  DailyChallengeSubmitGuessRequestSchema,
} from "@pokenerdle/shared/daily";
import { Response } from "express";
import * as z from "zod";
import { StatusCode } from "../data/const.js";
import { posthog } from "../lib/posthog.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { migrateUserGuesses } from "../repositories/daily.repository.js";
import {
  getCalendarDataService,
  getDailyPokemonAnswer,
  getUserGuessesForDateService,
  getUserStats,
  hasUserCompletedDailyChallenge,
  submitGuess,
} from "../services/daily.service.js";
import { getUserId } from "../utils/userIdentification.js";

export const submitDailyPokemonGuessController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const parsed = DailyChallengeSubmitGuessRequestSchema.safeParse(req.body);
  if (parsed.error) {
    res.status(StatusCode.BAD_REQUEST).json(z.treeifyError(parsed.error));
    return;
  }
  const { pokemon_id, date } = parsed.data;
  // User is guaranteed to exist due to middleware
  const userId = getUserId(req)!;

  try {
    const results = await submitGuess(userId, pokemon_id, date);
    res.json(results);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "archive challenge already completed") {
        res.status(StatusCode.CONFLICT).json({ error: error.message });
        return;
      }
      if (error.message === "cannot play future challenges") {
        res.status(StatusCode.BAD_REQUEST).json({ error: error.message });
        return;
      }
      if (error.message === "challenge does not exist") {
        res.status(StatusCode.NOT_FOUND).json({ error: error.message });
        return;
      }
      if (error.message === "hit limit") {
        res.status(StatusCode.BAD_REQUEST).json({ error: error.message });
        return;
      }
    }
    console.error("Error submitting guess:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to submit guess",
    });
  }
};

// TODO: Handle the case where user_id and posthogDistinctId exists
// and we need to merge the data
export const getUserGuessesController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { date } = req.query;
  // User is guaranteed to exist due to middleware
  const user_id = getUserId(req)!;

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
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = getUserId(req)!;
  const { date } = req.query;
  if (!date || typeof date !== "string") {
    res
      .status(StatusCode.BAD_REQUEST)
      .json({ error: "Date parameter is required" });
    return;
  }

  try {
    const hasCompletedChallenge = await hasUserCompletedDailyChallenge(
      userId,
      date,
    );
    if (!hasCompletedChallenge) {
      res
        .status(StatusCode.FORBIDDEN)
        .json({ error: "Daily challenge is not completed" });
      return;
    }

    const answer = await getDailyPokemonAnswer(date);
    res.json(answer);
  } catch (error) {
    console.error("Error getting daily pokemon answer:", error);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to get answer" });
  }
};

export const getUserStatsController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = getUserId(req)!;

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

export const migrateUserGuessesController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const user_id = getUserId(req)!;
  const posthogDistinctId = req.posthogDistinctId;
  if (posthogDistinctId?.endsWith(user_id)) {
    res.status(StatusCode.OK).end();
    return;
  }
  console.log("Migrating user guesses from", posthogDistinctId, "to", user_id);
  if (!user_id || !posthogDistinctId) {
    res.status(StatusCode.OK).end();
    return;
  }

  try {
    await migrateUserGuesses(posthogDistinctId, user_id);

    // Only alias when we actually have an authenticated user distinct from the
    // anonymous posthog id. posthogDistinctId carries a `posthog_` prefix from
    // auth middleware; strip it so PostHog sees the raw browser distinct_id.
    if (req.user?.id) {
      const rawPosthogDistinctId = posthogDistinctId.replace(/^posthog_/, "");
      console.log(
        "PostHog alias: linking",
        rawPosthogDistinctId,
        "→",
        req.user.id,
      );
      posthog.alias({
        distinctId: req.user.id,
        alias: rawPosthogDistinctId,
      });
    }

    res.status(StatusCode.OK).end();
  } catch (error) {
    console.error("Error migrating user guesses:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to migrate user guesses",
    });
  }
};

export const getCalendarController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const parsed = DailyChallengeCalendarRequestSchema.safeParse(req.query);
  if (parsed.error) {
    res.status(StatusCode.BAD_REQUEST).json(z.treeifyError(parsed.error));
    return;
  }

  const userId = getUserId(req)!;
  const { month } = parsed.data;

  try {
    const result = await getCalendarDataService(userId, month);
    res.json(result);
  } catch (error) {
    console.error("Error getting calendar data:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to get calendar data",
    });
  }
};
