import { Router } from "express";
import {
  getDailyPokemonAnswerController,
  getUserGuessesController,
  getUserStatsController,
  migrateUserGuessesController,
  submitDailyPokemonGuessController,
  syncUserGuessesController,
} from "../controllers/daily.controllers.js";
import { RouteNames } from "../data/const.js";
import {
  authenticateUser,
  optionalAuthenticateUser,
  strictAuthenticateUser,
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
dailyRouter.get(
  "/challenge/stats",
  strictAuthenticateUser,
  getUserStatsController
);
dailyRouter.post(
  "/challenge/migrate",
  authenticateUser,
  migrateUserGuessesController
);

export default Router().use(RouteNames.DAILY_API, dailyRouter);
