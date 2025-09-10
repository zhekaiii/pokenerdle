import { PokeNerdleSocket } from "@/lib/types";
import {
  BattleRoomSettings,
  PokemonNamesResponse,
  PokemonWithAbilities,
} from "@pokenerdle/shared";
import { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  init: (
    socket: PokeNerdleSocket,
    onRoomReady: (roomCode: string, settings?: BattleRoomSettings) => void,
    setIsOpponentJoined: (value: boolean) => void,
    onError: (error: string | null) => void
  ) => {
    socket.on("roomCode", onRoomReady);
    socket.on("disconnect", () => {
      onRoomReady("");
    });
    socket.on("roomError", (error: string) => {
      console.error(error);
      onRoomReady("");
      onError(error);
    });
    socket.on("opponentJoined", (displayName: string | null) => {
      setIsOpponentJoined(true);
    });
    return socket;
  },
  createBattleRoom: (
    socket: PokeNerdleSocket,
    settings: BattleRoomSettings,
    isSinglePlayer?: boolean,
    displayName?: string
  ) => {
    socket.emit("create", { settings, isSinglePlayer, displayName });
  },
  joinRoom: (
    socket: PokeNerdleSocket,
    roomCode: string,
    displayName?: string
  ) => {
    socket.emit("join", roomCode, displayName);
  },
  validatePokemon: (
    socket: PokeNerdleSocket,
    pokemon: PokemonNamesResponse,
    roomId: string
  ) => {
    socket.emit("answer", pokemon, roomId);
  },
  getStarterPokemon: async (roomId: string) => {
    const { data } = await axiosInstance.get<PokemonWithAbilities>(
      "/v1/battles/starter-pokemon",
      {
        params: { roomId },
      }
    );
    return data;
  },
});
