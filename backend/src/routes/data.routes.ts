import { Router } from "express";
import { getPokemonNames } from "../controllers/data.controllers.js";

const router = Router();

router.get("/pokemon-names", getPokemonNames);

export default router;
