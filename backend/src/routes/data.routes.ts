import { Router } from "express";
import {
  getPokemonIcons,
  getPokemonNames,
} from "../controllers/data.controllers.js";
import { RouteNames } from "../data/const.js";

const router = Router();

router.get("/pokemon-names", getPokemonNames);
router.get("/pokemon-icons", getPokemonIcons);

export default Router().use(RouteNames.DATA_API, router);
