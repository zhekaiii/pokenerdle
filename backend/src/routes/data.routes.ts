import { Router } from "express";
import {
  getPokemonNames,
  getStarterPokemon,
} from "../controllers/data.controllers.js";

const router = Router();

router.get("/pokemon-names", getPokemonNames);
router.get("/starter-pokemon", getStarterPokemon);

export default router;
