import { io, Socket } from "socket.io-client";

export default {
  connect: (
    onRoomReady: (
      roomCode: string,
      timer: number,
      showAbility: boolean
    ) => void,
    setIsOpponentJoined: (value: boolean) => void,
    onError: (error: string | null) => void
  ) => {
    const socket = io(`${import.meta.env.VITE_BACKEND_URL}/ws/battles`);
    socket.on("roomCode", onRoomReady);
    socket.on("disconnect", () => {
      onRoomReady("", 20, true);
    });
    socket.on("roomError", (error: string) => {
      console.error(error);
      onRoomReady("", 20, true);
      onError(error);
    });
    socket.on("opponentJoined", () => {
      setIsOpponentJoined(true);
    });
    return socket;
  },
  createBattleRoom: (socket: Socket, timer: number, showAbility: boolean) => {
    socket.emit("create", timer, showAbility);
  },
  joinRoom: (socket: Socket, roomCode: string) => {
    socket.emit("join", roomCode);
  },
  validatePokemon: (socket: Socket, pokemonName: string, roomId: string) => {
    socket.emit("answer", pokemonName, roomId);
  },
};
