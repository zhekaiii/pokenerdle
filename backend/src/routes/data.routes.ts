import { Router } from "express";
import { getPokemonNames } from "../controllers/data.controllers.js";
import { RouteNames } from "../data/const.js";

const router = Router();

router.get("/pokemon-names", getPokemonNames);

export default Router().use(RouteNames.DATA_ENDPOINT, router);
