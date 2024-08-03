import { Server } from "socket.io";
import {
  createBattleRoom,
  joinRoom,
  validatePokemon,
} from "../controllers/battles.controllers.js";
import { RouteNames } from "../data/const.js";

export const initializeBattleWsRoutes = (io: Server) => {
  io.of(RouteNames.BATTLES_WS).on("connection", (socket) => {
    socket.on("create", () => createBattleRoom(socket));
    socket.on("join", (roomId: string) => joinRoom(socket, roomId));
    socket.on("answer", (pokemonName: string, roomId: string) =>
      validatePokemon(socket, pokemonName, roomId)
    );
  });
};
