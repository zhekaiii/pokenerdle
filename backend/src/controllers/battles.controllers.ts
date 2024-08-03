import { Pokemon } from "pokedex-promise-v2";
import { Socket } from "socket.io";
import { RouteNames } from "../data/const.js";
import { ErrorRoomNotFound } from "../errors/index.js";
import { io } from "../index.js";
import * as dataService from "../services/data.services.js";
import { createRandomString } from "../utils/random.js";

type BattleRoom = {
  players: [string] | [string, string];
  pokemon: Pokemon[];
};

const ongoingBattles: Record<string, BattleRoom> = {};

const onSocketDisconnect = (socket: Socket, roomId: string) => {
  console.log(`Socket ${socket.id} left room ${roomId}`);
  if (roomId in ongoingBattles) {
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

export const createBattleRoom = async (socket: Socket) => {
  while (true) {
    const roomId = createRandomString(8);
    if (roomId in ongoingBattles) {
      continue;
    }
    ongoingBattles[roomId] = {
      players: [socket.id],
      pokemon: [],
    };
    socket.on("disconnect", () => onSocketDisconnect(socket, roomId));
    socket.join(roomId);
    socket.emit("roomCode", roomId);
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
  if (ongoingBattles[roomId].players.length === 2) {
    socket.emit("roomError", ErrorRoomNotFound);
    return;
  }
  ongoingBattles[roomId].players = [
    ongoingBattles[roomId].players[0],
    socket.id,
  ];
  socket.join(roomId);
  socket.emit("roomCode", roomId);
  socket.on("disconnect", () => onSocketDisconnect(socket, roomId));
  io.of(RouteNames.BATTLES_WS).to(roomId).emit("opponentJoined");
  console.log(ongoingBattles);

  const pokemon = await dataService.getStarterPokemon();
  ongoingBattles[roomId].pokemon.push(pokemon);
  io.of(RouteNames.BATTLES_WS).to(roomId).emit("pushPokemon", pokemon);
  console.log(`Pushed Pokemon ${pokemon.name} to room ${roomId}`);

  const firstPlayer =
    ongoingBattles[roomId].players[Math.random() < 0.5 ? 0 : 1];
  io.of(RouteNames.BATTLES_WS).to(roomId).emit("canMove", firstPlayer);
};

export const validatePokemon = async (
  socket: Socket,
  pokemonName: string,
  roomId: string
) => {
  const previousPokemonName = ongoingBattles[roomId].pokemon.at(-1)!.name;
  const pokemon = await dataService.validatePokemon(
    pokemonName,
    previousPokemonName
  );
  if (!pokemon) {
    socket.emit("wrongAnswer", "Invalid Pokemon");
    return;
  }
  ongoingBattles[roomId].pokemon.push(pokemon);
  io.of(RouteNames.BATTLES_WS)
    .to(roomId)
    .emit("pushPokemon", pokemon, socket.id);

  const nextPlayer = ongoingBattles[roomId].players.find(
    (id) => id !== socket.id
  );
  io.of(RouteNames.BATTLES_WS).to(roomId).emit("canMove", nextPlayer);
};
