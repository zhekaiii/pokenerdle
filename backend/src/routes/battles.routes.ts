import { Router } from "express";
import { getStarterPokemon } from "../controllers/battles.controllers.js";
import { RouteNames } from "../data/const.js";

const router = Router();

router.get("/starter-pokemon", getStarterPokemon);

export default Router().use(RouteNames.BATTLES_API, router);
