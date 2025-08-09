import { Router } from "express";
import { verifyDailyPokemonGuessController } from "../controllers/daily.controllers.js";
import { RouteNames } from "../data/const.js";

const dailyRouter = Router();

dailyRouter.post("/challenge/guess", verifyDailyPokemonGuessController);

export default Router().use(RouteNames.DAILY_API, dailyRouter);
