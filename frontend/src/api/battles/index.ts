import { PokemonNamesResponse, PokemonWithAbilities } from "@pokenerdle/shared";
import axios from "axios";
import { Socket } from "socket.io-client";
import { BattleRoomSettings } from "./types";

export default {
  init: (
    socket: Socket,
    onRoomReady: (roomCode: string, settings?: BattleRoomSettings) => void,
    setIsOpponentJoined: (value: boolean) => void,
    onError: (error: string | null) => void
  ) => {
    socket.on("roomCode", onRoomReady);
    socket.on("disconnect", () => {
      onRoomReady("");
      socket.removeAllListeners();
    });
    socket.on("roomError", (error: string) => {
      console.error(error);
      onRoomReady("");
      onError(error);
    });
    socket.on("opponentJoined", () => {
      setIsOpponentJoined(true);
    });
    return socket;
  },
  createBattleRoom: (socket: Socket, settings: BattleRoomSettings) => {
    socket.emit("create", settings);
  },
  joinRoom: (socket: Socket, roomCode: string) => {
    socket.emit("join", roomCode);
  },
  validatePokemon: (
    socket: Socket,
    pokemon: PokemonNamesResponse,
    roomId: string
  ) => {
    socket.emit("answer", pokemon, roomId);
  },
  getStarterPokemon: async (roomId: string) => {
    const { data } = await axios.get<PokemonWithAbilities>(
      "/v1/battles/starter-pokemon",
      {
        params: { roomId },
      }
    );
    return data;
  },
};
