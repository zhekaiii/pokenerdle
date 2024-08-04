import axios from "axios";
import { Pokemon } from "pokeapi-js-wrapper";
import { io, Socket } from "socket.io-client";
import { BattleRoomSettings } from "./types";

export default {
  connect: (
    onRoomReady: (roomCode: string, settings?: BattleRoomSettings) => void,
    setIsOpponentJoined: (value: boolean) => void,
    onError: (error: string | null) => void,
    setSocket: (socket?: Socket) => void
  ) => {
    const socket = io(`${import.meta.env.VITE_BACKEND_URL}/ws/battles`);
    socket.on("roomCode", onRoomReady);
    socket.on("disconnect", () => {
      onRoomReady("");
      setSocket(undefined);
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
  validatePokemon: (socket: Socket, pokemonName: string, roomId: string) => {
    socket.emit("answer", pokemonName, roomId);
  },
  getStarterPokemon: async (roomId: string) => {
    const { data } = await axios.get<Pokemon>("/v1/battles/starter-pokemon", {
      params: { roomId },
    });
    return data;
  },
};
