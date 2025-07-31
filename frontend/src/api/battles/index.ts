import { PokeNerdleSocket } from "@/lib/types";
import {
  BattleRoomSettings,
  PokemonNamesResponse,
  PokemonWithAbilities,
} from "@pokenerdle/shared";
import axios from "axios";

export default {
  init: (
    socket: PokeNerdleSocket,
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
  createBattleRoom: (
    socket: PokeNerdleSocket,
    settings: BattleRoomSettings
  ) => {
    socket.emit("create", settings);
  },
  joinRoom: (socket: PokeNerdleSocket, roomCode: string) => {
    socket.emit("join", roomCode);
  },
  validatePokemon: (
    socket: PokeNerdleSocket,
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
