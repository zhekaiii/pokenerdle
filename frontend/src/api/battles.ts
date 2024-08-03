import { io, Socket } from "socket.io-client";

export default {
  connect: (
    setRoomCode: (roomCode: string | null) => void,
    setIsOpponentJoined: (value: boolean) => void,
    onError: (error: string | null) => void
  ) => {
    const socket = io(`${import.meta.env.VITE_BACKEND_URL}/ws/battles`);
    socket.on("roomCode", (roomCode: string) => setRoomCode(roomCode));
    socket.on("disconnect", () => {
      setRoomCode(null);
    });
    socket.on("roomError", (error: string) => {
      console.error(error);
      setRoomCode(null);
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
