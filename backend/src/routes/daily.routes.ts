import { Router } from "express";
import {
  getDailyPokemonAnswerController,
  getUserGuessesController,
  getUserStatsController,
  submitDailyPokemonGuessController,
  syncUserGuessesController,
} from "../controllers/daily.controllers.js";
import { RouteNames } from "../data/const.js";
import {
  authenticateUser,
  optionalAuthenticateUser,
} from "../middlewares/auth.js";

const dailyRouter = Router();

dailyRouter.post(
  "/challenge/submit",
  optionalAuthenticateUser,
  submitDailyPokemonGuessController
);
dailyRouter.post(
  "/challenge/sync",
  authenticateUser,
  syncUserGuessesController
);
dailyRouter.get(
  "/challenge/guesses",
  authenticateUser,
  getUserGuessesController
);
dailyRouter.get("/challenge/answer", getDailyPokemonAnswerController);
dailyRouter.get("/challenge/stats", authenticateUser, getUserStatsController);

export default Router().use(RouteNames.DAILY_API, dailyRouter);
