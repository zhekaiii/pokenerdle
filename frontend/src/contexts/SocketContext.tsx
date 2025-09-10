import { PokeNerdleSocket } from "@/lib/types";
import { useState } from "react";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../api";
import { SocketContext } from "../hooks/useSocket";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket] = useState<PokeNerdleSocket>(() =>
    import.meta.env.SSR
      ? // We only use sockets in client side, so we need to use a dummy socket in SSR
        ({ id: "ssr" } as unknown as PokeNerdleSocket)
      : io(`${BACKEND_URL}/ws/battles`, {
          transports: ["websocket", " polling", "flashsocket"],
        })
  );

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
