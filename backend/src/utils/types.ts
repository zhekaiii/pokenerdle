import { ClientToServerEvents, ServerToClientEvents } from "@pokenerdle/shared";
import { Server, Socket } from "socket.io";

export const isTruthy = <T>(value: T | null | undefined): value is T =>
  Boolean(value);

export type PokeNerdleServer = Server<
  ClientToServerEvents,
  ServerToClientEvents
>;

export type PokeNerdleSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents
>;
