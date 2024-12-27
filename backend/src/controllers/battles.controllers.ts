import { Request, Response } from "express";
import { ongoingBattles } from "../lib/battles.js";

export const getStarterPokemon = async (req: Request, res: Response) => {
  const roomId = req.query.roomId as string;
  const room = ongoingBattles[roomId];
  if (!room) {
    return;
  }
  const pokemon = room.pokemon[0];
  console.log(`Starter Pokemon of room ${roomId} is ${pokemon.name}`);
  res.json(pokemon);
};
