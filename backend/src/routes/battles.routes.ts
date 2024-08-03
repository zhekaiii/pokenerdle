import { Server } from "socket.io";
import {
  createBattleRoom,
  joinRoom,
} from "../controllers/battles.controllers.js";
import { RouteNames } from "../data/const.js";

export const initializeBattleRoutes = (io: Server) => {
  io.of(RouteNames.BATTLES).on("connection", (socket) => {
    socket.on("create", () => createBattleRoom(socket));
    socket.on("join", (roomId: string) => joinRoom(socket, roomId));
  });
};
