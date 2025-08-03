import { Router } from "express";
import { getPathFinderChallenge } from "../controllers/pathfinder.controllers.js";

const router = Router();

router.get("/challenge", getPathFinderChallenge);

export default Router().use("/v1/pathfinder", router);
