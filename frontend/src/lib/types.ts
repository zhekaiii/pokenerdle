import { ClientToServerEvents, ServerToClientEvents } from "@pokenerdle/shared";
import { Socket } from "socket.io-client";

export type PokeNerdleSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;
