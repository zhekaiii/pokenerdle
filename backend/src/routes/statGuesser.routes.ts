import { Router } from "express";
import {
  getFormatsController,
  getRoundController,
} from "../controllers/statGuesser.controllers.js";
import { RouteNames } from "../data/const.js";

const router = Router();

router.get("/formats", getFormatsController);
router.get("/round", getRoundController);

export default Router().use(RouteNames.STAT_GUESS_API, router);
