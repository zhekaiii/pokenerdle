import { Request, Response } from "express";
import { Socket } from "socket.io";
import { RouteNames } from "../data/const.js";
import { ErrorRoomNotFound } from "../errors/index.js";
import { io } from "../index.js";
import * as dataService from "../services/data.services.js";
import { createRandomString } from "../utils/random.js";
import { BattleRoom, BattleRoomSettings } from "./types.js";

const ongoingBattles: Record<string, BattleRoom> = {};

export const onSocketDisconnect = (socket: Socket) => {
  const roomId = getUserRoom(socket);
  if (!roomId) {
    return;
  }
  console.log(`Socket ${socket.id} left room ${roomId}`);
  const room = ongoingBattles[roomId];
  room.timer && clearTimeout(room.timer);
  ongoingBattles[roomId].players.forEach((id) => {
    if (id !== socket.id) {
      socket.to(id).emit("roomError", "Opponent disconnected");
    }
    socket.leave(roomId);
  });
  delete ongoingBattles[roomId];
  console.log(ongoingBattles);
};

const nextTurn = (roomId: string) => {
  const room = ongoingBattles[roomId];
  // only switch turn if it is not the first turn
  room.turn = Number(!room.turn);
  const nextPlayer = room.players[room.turn];
  console.log("Timeout");
  io.of(RouteNames.BATTLES_WS)
    .to(roomId)
    .emit("canMove", nextPlayer, Date.now() + room.settings.timer * 1000);
  room.timer = setTimeout(() => {
    nextTurn(roomId);
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

    const pokemon = await dataService.getStarterPokemon();
    ongoingBattles[roomId] = {
      players: [socket.id],
      pokemon: [pokemon],
      settings,
      timer: null,
      turn: Math.random() < 0.5 ? 0 : 1,
      readyCount: 0,
    };
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
  io.of(RouteNames.BATTLES_WS).to(roomId).emit("opponentJoined");
  console.log(ongoingBattles);
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

  nextTurn(roomId);
};

export const checkIsUsersTurn = (
  socket: Socket,
  callback: (isTurn: boolean) => void
) => {
  const roomId = getUserRoom(socket);
  if (!roomId) {
    return;
  }
  callback(
    ongoingBattles[roomId].players[ongoingBattles[roomId].turn] == socket.id
  );
};

export const getUserRoom = (socket: Socket) => {
  const roomId = Object.keys(ongoingBattles).find((roomId) =>
    socket.rooms.has(roomId)
  );
  return roomId;
};

export const userReady = (socket: Socket) => {
  console.log(`User ${socket.id} is ready`);
  const roomId = getUserRoom(socket);
  if (!roomId) {
    return;
  }
  const room = ongoingBattles[roomId];
  room.readyCount++;
  if (room.readyCount === 2) {
    console.log("Both players are ready");
    io.of(RouteNames.BATTLES_WS).to(roomId).emit("startGame");
    room.timer = setTimeout(() => {
      nextTurn(roomId);
    }, room.settings.timer * 1000);
  }
};

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
