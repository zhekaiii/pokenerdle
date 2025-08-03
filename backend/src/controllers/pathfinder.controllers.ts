import { Request, Response } from "express";
import * as pathfinderService from "../services/pathfinder.services.js";

export const getPathFinderChallenge = async (req: Request, res: Response) => {
  res.json(await pathfinderService.getRandomPathWithStartEndPokemon());
};
