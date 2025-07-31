import { PokeNerdleSocket } from "@/lib/types";
import { createContext, useContext } from "react";

export const SocketContext = createContext<PokeNerdleSocket | null>(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};
