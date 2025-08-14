import { Router } from "express";
import {
  getDailyPokemonAnswerController,
  verifyDailyPokemonGuessController,
} from "../controllers/daily.controllers.js";
import { RouteNames } from "../data/const.js";

const dailyRouter = Router();

dailyRouter.post("/challenge/guess", verifyDailyPokemonGuessController);
dailyRouter.get("/challenge/answer", getDailyPokemonAnswerController);

export default Router().use(RouteNames.DAILY_API, dailyRouter);
