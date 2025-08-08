import { Request, Response } from "express";
import { StatusCode } from "../data/const.js";
import { getDailyPokemon } from "../services/daily.service.js";

export const getDailyPokemonController = async (
  req: Request,
  res: Response
) => {
  const pokemon = await getDailyPokemon();
  if (!pokemon) {
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "unable to get daily pokemon" });
    return;
  }
  res.json(pokemon);
};
