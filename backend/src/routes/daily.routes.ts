import { Router } from "express";
import {
  getCalendarController,
  getDailyPokemonAnswerController,
  getUserGuessesController,
  getUserStatsController,
  migrateUserGuessesController,
  submitDailyPokemonGuessController,
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
dailyRouter.get(
  "/challenge/guesses",
  authenticateUser,
  getUserGuessesController
);
dailyRouter.get("/challenge/answer", getDailyPokemonAnswerController);
dailyRouter.get(
  "/challenge/calendar",
  authenticateUser,
  getCalendarController
);
dailyRouter.get("/challenge/stats", authenticateUser, getUserStatsController);
dailyRouter.post(
  "/challenge/migrate",
  authenticateUser,
  migrateUserGuessesController
);

export default Router().use(RouteNames.DAILY_API, dailyRouter);
