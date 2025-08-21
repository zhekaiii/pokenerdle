import { Router } from "express";
import {
  getDailyPokemonAnswerController,
  getUserGuessesController,
  submitDailyPokemonGuessController,
  syncUserGuessesController,
} from "../controllers/daily.controllers.js";
import { RouteNames } from "../data/const.js";

const dailyRouter = Router();

dailyRouter.post("/challenge/submit", submitDailyPokemonGuessController);
dailyRouter.post("/challenge/sync", syncUserGuessesController);
dailyRouter.get("/challenge/guesses", getUserGuessesController);
dailyRouter.get("/challenge/answer", getDailyPokemonAnswerController);

export default Router().use(RouteNames.DAILY_API, dailyRouter);
