import { Socket } from "socket.io";
import { RouteNames } from "../data/const.js";
import { ErrorRoomNotFound } from "../errors/index.js";
import { io } from "../index.js";
import * as dataService from "../services/data.services.js";
import { createRandomString } from "../utils/random.js";
import { BattleRoom, BattleRoomSettings } from "./types.js";

const ongoingBattles: Record<string, BattleRoom> = {};

const onSocketDisconnect = (socket: Socket, roomId: string) => {
  console.log(`Socket ${socket.id} left room ${roomId}`);
  if (roomId in ongoingBattles) {
    const room = ongoingBattles[roomId];
    room.timer && clearTimeout(room.timer);
    ongoingBattles[roomId].players.forEach((id) => {
      if (id !== socket.id) {
        socket.to(id).emit("roomError", "Opponent disconnected");
      }
      socket.leave(roomId);
    });
    delete ongoingBattles[roomId];
  }
  console.log(ongoingBattles);
};

const onTimeout = (roomId: string, turn: string) => {
  const room = ongoingBattles[roomId];
  console.log("Timeout");
  io.of(RouteNames.BATTLES_WS)
    .to(roomId)
    .emit("canMove", turn, Date.now() + room.settings.timer * 1000);
  room.timer = setTimeout(() => {
    onTimeout(roomId, room.players.find((id) => id !== turn)!);
  }, room.settings.timer * 1000);
};

export const createBattleRoom = async (
  socket: Socket,
  settings: BattleRoomSettings
) => {
  while (true) {
    const roomId = createRandomString(8);
    if (roomId in ongoingBattles) {
      continue;
    }
    ongoingBattles[roomId] = {
      players: [socket.id],
      pokemon: [],
      settings,
      timer: null,
    };
    socket.on("disconnect", () => onSocketDisconnect(socket, roomId));
    socket.join(roomId);
    socket.emit("roomCode", roomId, settings);
    console.log("Room created", roomId);
    console.log(ongoingBattles);
    return;
  }
};

export const joinRoom = async (socket: Socket, roomId: string) => {
  console.log("Joining room", roomId);
  if (!(roomId in ongoingBattles)) {
    socket.emit("roomError", ErrorRoomNotFound);
    return;
  }
  const room = ongoingBattles[roomId];
  if (room.players.length === 2) {
    socket.emit("roomError", ErrorRoomNotFound);
    return;
  }
  room.players = [room.players[0], socket.id];
  socket.join(roomId);
  socket.emit("roomCode", roomId, room.settings);
  socket.on("disconnect", () => onSocketDisconnect(socket, roomId));
  io.of(RouteNames.BATTLES_WS).to(roomId).emit("opponentJoined");
  console.log(ongoingBattles);

  const pokemon = await dataService.getStarterPokemon();
  room.pokemon.push(pokemon);
  io.of(RouteNames.BATTLES_WS).to(roomId).emit("pushPokemon", pokemon);
  console.log(`Pushed Pokemon ${pokemon.name} to room ${roomId}`);

  const firstPlayer = room.players[Math.random() < 0.5 ? 0 : 1];
  const secondPlayer = room.players.find((id) => id !== firstPlayer)!;
  io.of(RouteNames.BATTLES_WS)
    .to(roomId)
    .emit("canMove", firstPlayer, Date.now() + room.settings.timer * 1000);
  room.timer = setTimeout(() => {
    onTimeout(roomId, secondPlayer);
  }, room.settings.timer * 1000);
};

export const validatePokemon = async (
  socket: Socket,
  pokemonName: string,
  roomId: string
) => {
  const room = ongoingBattles[roomId];
  const previousPokemonName = room.pokemon.at(-1)!.name;
  const pokemon = await dataService.validatePokemon(
    pokemonName,
    previousPokemonName
  );
  if (!pokemon) {
    socket.emit("wrongAnswer", "Invalid Pokemon");
    return;
  }
  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }
  room.pokemon.push(pokemon);
  io.of(RouteNames.BATTLES_WS)
    .to(roomId)
    .emit("pushPokemon", pokemon, socket.id);

  const nextPlayer = room.players.find((id) => id !== socket.id);
  io.of(RouteNames.BATTLES_WS)
    .to(roomId)
    .emit("canMove", nextPlayer, Date.now() + room.settings.timer * 1000);
  room.timer = setTimeout(() => {
    onTimeout(roomId, socket.id);
  }, room.settings.timer * 1000);
};
