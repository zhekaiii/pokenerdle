import { Router } from "express";
import { getPathFinderChallenge } from "../controllers/pathfinder.controllers.js";
import { RouteNames } from "../data/const.js";

const router = Router();

router.get("/challenge", getPathFinderChallenge);

export default Router().use(RouteNames.PATHFINDER_API, router);
