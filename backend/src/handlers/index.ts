import { PokemonNamesResponse } from "@pokenerdle/shared";

import { RouteNames } from "../data/const.js";
import {
  checkIsUsersTurn,
  createBattleRoom,
  joinRoom,
  leaveRoom,
  onForfeit,
  onRematch,
  onSocketDisconnect,
  userReady,
  validatePokemon,
} from "../handlers/battles.js";
import { PokeNerdleServer } from "../utils/types.js";

export const initializeBattleWsRoutes = (io: PokeNerdleServer) => {
  io.of(RouteNames.BATTLES_WS).on("connection", (socket) => {
    socket.on("create", ({ settings, isSinglePlayer, displayName }) =>
      createBattleRoom(socket, settings, isSinglePlayer, displayName)
    );
    socket.on("join", (roomId: string, displayName?: string) =>
      joinRoom(socket, roomId, displayName)
    );
    socket.on("answer", (pokemon: PokemonNamesResponse, roomId: string) =>
      validatePokemon(socket, pokemon, roomId)
    );
    socket.on("leave", (roomId, callback) =>
      leaveRoom(socket, roomId, callback)
    );
    socket.on("disconnecting", () => onSocketDisconnect(socket));
    socket.on("isMyTurn", (callback) => {
      checkIsUsersTurn(socket, callback);
    });
    socket.on("ready", () => userReady(socket));
    socket.on("rematch", () => onRematch(socket));
    socket.on("forfeit", () => onForfeit(socket));
  });
};
