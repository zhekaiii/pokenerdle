import { Socket } from "socket.io";
import { ErrorRoomNotFound } from "../errors/index.js";
import { createRandomString } from "../utils/random.js";

const ongoingBattles: Record<string, [string, string] | [string]> = {};

const onSocketDisconnect = (socket: Socket, roomId: string) => {
  if (roomId in ongoingBattles) {
    ongoingBattles[roomId].forEach((id) => {
      if (id !== socket.id) {
        socket.to(id).emit("error", "Opponent disconnected");
      }
      socket.leave(roomId);
    });
    delete ongoingBattles[roomId];
  }
};

export const createBattleRoom = async (socket: Socket) => {
  while (true) {
    const roomId = createRandomString(8);
    if (roomId in ongoingBattles) {
      continue;
    }
    ongoingBattles[roomId] = [socket.id];
    socket.on("disconnect", () => onSocketDisconnect(socket, roomId));
    socket.join(roomId);
    socket.emit("roomCode", roomId);
    console.log("Room created", roomId);
    console.log(ongoingBattles);
    return;
  }
};

export const joinRoom = (socket: Socket, roomId: string) => {
  console.log("Joining room", roomId);
  console.log(ongoingBattles);
  if (!(roomId in ongoingBattles)) {
    socket.emit("error", ErrorRoomNotFound);
    return;
  }
  if (ongoingBattles[roomId].length === 2) {
    socket.emit("error", ErrorRoomNotFound);
    return;
  }
  ongoingBattles[roomId].push(socket.id);
  socket.join(roomId);
  socket.emit("roomCode", roomId);
  socket.on("disconnect", () => onSocketDisconnect(socket, roomId));
};
