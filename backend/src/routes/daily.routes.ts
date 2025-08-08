import { Router } from "express";
import { getDailyPokemonController } from "../controllers/daily.controllers.js";
import { RouteNames } from "../data/const.js";

const dailyRouter = Router();

dailyRouter.get("/challenge", getDailyPokemonController);

export default Router().use(RouteNames.DAILY_API, dailyRouter);
