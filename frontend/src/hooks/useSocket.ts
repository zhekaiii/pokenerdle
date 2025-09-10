import { BACKEND_URL } from "@/api";
import { PokeNerdleSocket } from "@/lib/types";
import { createContext, useContext } from "react";
import { io } from "socket.io-client";

export const createSocket = () =>
  import.meta.env.SSR
    ? // We only use sockets in client side, so we need to use a dummy socket in SSR
      ({ id: "ssr" } as unknown as PokeNerdleSocket)
    : io(`${BACKEND_URL}/ws/battles`, {
        transports: ["websocket", " polling", "flashsocket"],
      });

export const SocketContext = createContext<PokeNerdleSocket | null>(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};
