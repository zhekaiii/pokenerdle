import { PokeNerdleSocket } from "@/lib/types";
import { useState } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "../hooks/useSocket";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket] = useState<PokeNerdleSocket>(() =>
    io(`${import.meta.env.VITE_BACKEND_URL}/ws/battles`, {
      transports: ["websocket", " polling", "flashsocket"],
    })
  );

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
