import { BattleRoomSettings, PokemonNamesResponse } from "@pokenerdle/shared";
import { MAX_ABILITY_LINKS, TIMEOUT_PENALTY } from "../constants/game.js";
import { BattleRoom, TurnResult } from "../controllers/types.js";
import { RouteNames } from "../data/const.js";
import { ErrorRoomNotFound } from "../errors/index.js";
import { io } from "../index.js";
import { ongoingBattles } from "../lib/battles.js";
import { getPoints } from "../services/battle.service.js";
import * as dataService from "../services/data.services.js";
import { createRandomString } from "../utils/random.js";
import { PokeNerdleSocket } from "../utils/types.js";

export const onSocketDisconnect = (socket: PokeNerdleSocket) => {
  console.log(`Socket ${socket.id} disconnected.`);
  socket.rooms.forEach((roomId) => {
    leaveRoom(socket, roomId);
  });
  console.log(ongoingBattles);
};

const nextTurn = (roomId: string, isFirstTurn?: true) => {
  const room = ongoingBattles[roomId];
  // only switch turn if it is not the first turn or if is single player
  if (!isFirstTurn && room.numPlayers === 2) {
    room.turn = Number(!room.turn);
  }
  const nextPlayer = room.players[room.turn];
  io.of(RouteNames.BATTLES_WS)
    .to(roomId)
    .emit("canMove", nextPlayer, Date.now() + room.settings.timer * 1000);
  room.timer = setTimeout(() => {
    console.log("Timeout");
    // Only deduct points if there are more than 1 player
    if (room.numPlayers > 1) {
      room.points[room.turn] = Math.max(
        0,
        room.points[room.turn] - TIMEOUT_PENALTY
      );
    }
    io.of(RouteNames.BATTLES_WS)
      .to(roomId)
      .emit("gameEnd", {
        points: room.players.reduce((acc, socketId, index) => {
          acc[socketId] = room.points[index];
          return acc;
        }, {} as Record<string, number>),
      });
  }, room.settings.timer * 1000);
  room.turnStart = Date.now();
};

const initRoom = (
  room: Pick<BattleRoom, "players" | "pokemon" | "settings" | "numPlayers">
): BattleRoom => {
  return {
    players: room.players,
    pokemon: [room.pokemon[0]],
    settings: room.settings,
    timer: null,
    turn: room.numPlayers === 1 || Math.random() < 0.5 ? 0 : 1,
    turnStart: Date.now(),
    readyPlayers: [],
    wantToRematch: [],
    usedLinks: {},
    evolutionLinkCount: [0, 0],
    points: [0, 0],
    streak: [0, 0],
    numPlayers: room.numPlayers,
  };
};

export const createBattleRoom = async (
  socket: PokeNerdleSocket,
  settings: BattleRoomSettings,
  isSinglePlayer?: boolean
) => {
  console.log(`Received create request from ${socket.id}`);
  while (true) {
    const roomId = createRandomString(8);
    if (roomId in ongoingBattles) {
      continue;
    }

    const pokemon = await dataService.getStarterPokemon();
    ongoingBattles[roomId] = initRoom({
      players: [socket.id],
      pokemon: [pokemon],
      settings,
      numPlayers: isSinglePlayer ? 1 : 2,
    });
    socket.join(roomId);
    socket.emit("roomCode", roomId, settings, isSinglePlayer);
    console.log("Room created", roomId);
    console.log(ongoingBattles);
    return;
  }
};

export const joinRoom = (socket: PokeNerdleSocket, roomId: string) => {
  console.log("Joining room", roomId);
  if (!(roomId in ongoingBattles)) {
    socket.emit("roomError", ErrorRoomNotFound);
    return;
  }
  const room = ongoingBattles[roomId];
  if (room.players.length === 2) {
    if (!room.players.includes(socket.id)) {
      console.log(
        `${socket.id} tried to join but room ${roomId} has ${room.players}`
      );
      socket.emit("roomError", ErrorRoomNotFound);
    }
    return;
  }
  room.players = [room.players[0], socket.id];
  socket.join(roomId);
  socket.emit("roomCode", roomId, room.settings);
  io.of(RouteNames.BATTLES_WS).to(roomId).emit("opponentJoined");
  console.log(ongoingBattles);
};

export const leaveRoom = (
  socket: PokeNerdleSocket,
  roomId: string,
  callback?: () => void
) => {
  if (socket.id === roomId) {
    return;
  }
  console.log(`Socket ${socket.id} is leaving room ${roomId}.`);
  const room = ongoingBattles[roomId];
  if (!room) {
    return;
  }
  room.timer && clearTimeout(room.timer);
  ongoingBattles[roomId].players.forEach((id) => {
    if (id !== socket.id) {
      socket.to(id).emit("roomError", "Opponent left the battle!");
    }
    io.socketsLeave(roomId);
  });
  delete ongoingBattles[roomId];
  callback?.();
};

export const validatePokemon = async (
  socket: PokeNerdleSocket,
  pokemonGuess: PokemonNamesResponse,
  roomId: string
) => {
  const room = ongoingBattles[roomId];
  if (!room) {
    return;
  }
  if (room.players[room.turn] !== socket.id) {
    console.log(`${socket.id} tried to move out of turn`);
    return;
  }
  console.log(`${socket.id} answered ${pokemonGuess.name}`);
  const previousPokemon = room.pokemon.at(-1)!;
  const result = await dataService.validatePokemon(
    pokemonGuess,
    previousPokemon,
    room.usedLinks,
    room.evolutionLinkCount[room.turn]
  );

  const pointsAwarded = getPoints(result, room);
  room.points[room.turn] = Math.max(0, room.points[room.turn] + pointsAwarded);
  const newPoints = room.points[room.turn];
  console.log(room.points);

  if (!result.validAnswer) {
    io.of(RouteNames.BATTLES_WS).to(roomId).emit("wrongAnswer", {
      pokemonId: result.pokemonId,
      points: newPoints,
      player: socket.id,
      reason: result.reason,
    });
    room.streak[room.turn] = 0;
    console.log(room.streak);
    return;
  }
  room.streak[room.turn] += 1;
  console.log(room.streak);
  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }
  postTurn(room, result, room.turn);

  io.of(RouteNames.BATTLES_WS)
    .to(roomId)
    .emit(
      "pushPokemon",
      result.pokemon,
      socket.id,
      result.sameSpecies,
      result.isSameEvoline,
      newPoints
    );

  nextTurn(roomId);
};

const postTurn = (room: BattleRoom, turnResult: TurnResult, turn: number) => {
  if (!turnResult.validAnswer) {
    return;
  }
  for (const abilityName of turnResult.usedLinks) {
    room.usedLinks[abilityName] = Math.min(
      (room.usedLinks[abilityName] ?? 0) + 1,
      MAX_ABILITY_LINKS
    );
  }
  if (turnResult.isSameEvoline) {
    room.evolutionLinkCount[turn] += 1;
  }
  room.pokemon.push(turnResult.pokemon);
};

export const checkIsUsersTurn = (
  socket: PokeNerdleSocket,
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

export const getUserRoom = (socket: PokeNerdleSocket) => {
  const roomId = Object.keys(ongoingBattles).find((roomId) =>
    socket.rooms.has(roomId)
  );
  return roomId;
};

export const userReady = (socket: PokeNerdleSocket) => {
  const roomId = getUserRoom(socket);
  if (!roomId) {
    return;
  }
  const room = ongoingBattles[roomId];
  if (room.readyPlayers.includes(socket.id)) {
    return;
  }
  console.log(`User ${socket.id} is ready`);
  room.readyPlayers.push(socket.id);
  io.of(RouteNames.BATTLES_WS).to(roomId).emit("ready", socket.id);
  if (room.readyPlayers.length === room.numPlayers) {
    console.log("All players are ready");
    io.of(RouteNames.BATTLES_WS).to(roomId).emit("startGame");
    nextTurn(roomId, true);
  }
};
export const onRematch = async (socket: PokeNerdleSocket) => {
  console.log(`User ${socket.id} wants to rematch`);
  const roomId = getUserRoom(socket);
  if (!roomId) {
    return;
  }
  const room = ongoingBattles[roomId];
  if (room.wantToRematch.includes(socket.id)) {
    return;
  }
  room.wantToRematch.push(socket.id);
  const readyToStart = room.wantToRematch.length == room.numPlayers;
  if (readyToStart) {
    const newStarterPokemon = await dataService.getStarterPokemon();
    room.pokemon = [newStarterPokemon];
    ongoingBattles[roomId] = initRoom(room);
  }
  io.of(RouteNames.BATTLES_WS)
    .to(roomId)
    .emit("rematch", socket.id, readyToStart, room.pokemon[0]);
};

export const onForfeit = (socket: PokeNerdleSocket) => {
  console.log(`User ${socket.id} forfeited the match`);
  const roomId = getUserRoom(socket);
  if (!roomId) {
    return;
  }
  const room = ongoingBattles[roomId];
  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }

  room.forfeitInfo = {
    forfeit: true,
    forfeitedBy: socket.id,
  };

  // End the game with forfeit flag
  io.of(RouteNames.BATTLES_WS)
    .to(roomId)
    .emit("gameEnd", {
      forfeitInfo: room.forfeitInfo,
      points: room.players.reduce((acc, socketId, index) => {
        acc[socketId] = room.points[index];
        return acc;
      }, {} as Record<string, number>),
    });
};
