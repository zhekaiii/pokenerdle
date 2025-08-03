import { Router } from "express";
import {
  getPokemonIcons,
  getPokemonNames,
  getPokemonWithAbilities,
} from "../controllers/data.controllers.js";
import { RouteNames } from "../data/const.js";

const router = Router();

router.get("/pokemon-names", getPokemonNames);
router.get("/pokemon-icons", getPokemonIcons);
router.get("/pokemon", getPokemonWithAbilities);

export default Router().use(RouteNames.DATA_API, router);
