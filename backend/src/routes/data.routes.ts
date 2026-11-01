import { Router } from "express";
import {
  getPokemonIcons,
  getPokemonIdsByGeneration,
  getPokemonNames,
  getPokemonWithAbilities,
} from "../controllers/data.controllers.js";
import { RouteNames } from "../data/const.js";
import {
  cachePokemonGenerations,
  cachePokemonIcons,
  cachePokemonNames,
  validatePokemonGeneration,
} from "../middlewares/data.js";

const router = Router();

router.get("/pokemon-names", cachePokemonNames, getPokemonNames);
router.get("/pokemon-icons", cachePokemonIcons, getPokemonIcons);
router.get(
  "/pokemon-generations",
  validatePokemonGeneration,
  cachePokemonGenerations,
  getPokemonIdsByGeneration,
);
router.get("/pokemon", getPokemonWithAbilities);

export default Router().use(RouteNames.DATA_API, router);
