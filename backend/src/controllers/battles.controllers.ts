import { Request, Response } from "express";
import { StatusCode } from "../data/const.js";
import * as battlesService from "../services/battles.services.js";

export const createBattleRoom = async (req: Request, res: Response) => {
  const roomId = battlesService.generateRoomId();
  res.status(StatusCode.CREATED).send(roomId);
};
