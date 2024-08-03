import { Router } from "express";
import {
  getPokemonNames,
  getStarterPokemon,
} from "../controllers/data.controllers.js";
import { RouteNames } from "../data/const.js";

const router = Router();

router.get("/pokemon-names", getPokemonNames);
router.get("/starter-pokemon", getStarterPokemon);

export default Router().use(RouteNames.DATA, router);
