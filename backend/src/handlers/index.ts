import { PokemonNamesResponse } from "@pokenerdle/shared";
import { Server } from "socket.io";
import { BattleRoomSettings } from "../controllers/types.js";

import { RouteNames } from "../data/const.js";
import {
  checkIsUsersTurn,
  createBattleRoom,
  joinRoom,
  leaveRoom,
  onRematch,
  onSocketDisconnect,
  userReady,
  validatePokemon,
} from "../handlers/battles.js";

export const initializeBattleWsRoutes = (io: Server) => {
  io.of(RouteNames.BATTLES_WS).on("connection", (socket) => {
    socket.on("create", (settings: BattleRoomSettings) =>
      createBattleRoom(socket, settings)
    );
    socket.on("join", (roomId: string) => joinRoom(socket, roomId));
    socket.on("answer", (pokemon: PokemonNamesResponse, roomId: string) =>
      validatePokemon(socket, pokemon, roomId)
    );
    socket.on("leave", (roomId: string, callback: () => void) =>
      leaveRoom(socket, roomId, callback)
    );
    socket.on("disconnecting", () => onSocketDisconnect(socket));
    socket.on("isMyTurn", (callback) => {
      checkIsUsersTurn(socket, callback);
    });
    socket.on("ready", () => userReady(socket));
    socket.on("rematch", () => onRematch(socket));
  });
};
