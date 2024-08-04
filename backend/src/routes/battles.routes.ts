import { Router } from "express";
import { Server } from "socket.io";
import {
  checkIsUsersTurn,
  createBattleRoom,
  getStarterPokemon,
  joinRoom,
  onSocketDisconnect,
  userReady,
  validatePokemon,
} from "../controllers/battles.controllers.js";
import { BattleRoomSettings } from "../controllers/types.js";
import { RouteNames } from "../data/const.js";

export const initializeBattleWsRoutes = (io: Server) => {
  io.of(RouteNames.BATTLES_WS).on("connection", (socket) => {
    socket.on("create", (settings: BattleRoomSettings) =>
      createBattleRoom(socket, settings)
    );
    socket.on("join", (roomId: string) => joinRoom(socket, roomId));
    socket.on("answer", (pokemonName: string, roomId: string) =>
      validatePokemon(socket, pokemonName, roomId)
    );
    socket.on("disconnecting", () => onSocketDisconnect(socket));
    socket.on("isMyTurn", (callback) => {
      checkIsUsersTurn(socket, callback);
    });
    socket.on("ready", () => userReady(socket));
  });
};

const router = Router();

router.get("/starter-pokemon", getStarterPokemon);

export default Router().use(RouteNames.BATTLES_API, router);
