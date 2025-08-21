import { useToast } from "@/hooks/useToast";
import { TriangleAlert } from "lucide-react";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useSocket } from "../../hooks/useSocket";
import GameScreen from "./GameScreen";
import PokeChainLobby from "./PokeChainLobby";
import WaitingLobby from "./WaitingLobby";
import {
  PokeChainContextProvider,
  usePokeChainContext,
} from "./context/PokeChainContext";

const PokeChain: React.FC = () => {
  const socket = useSocket();
  const {
    roomCode,
    isSinglePlayer,
    isOpponentConnected,
    setSettings,
    setIsSinglePlayer,
    setIsOpponentConnected,
    setRoomCode,
  } = usePokeChainContext();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const exitRoom = () => {
    if (!roomCode) return;
    socket.emit("leave", roomCode, () => {
      setRoomCode(null);
      setIsOpponentConnected(false);
      setSettings({ timer: 20, showAbility: true });
      setSearchParams();
    });
  };

  useEffect(() => {
    socket.on("roomCode", (roomCode, settings, isSinglePlayer) => {
      setRoomCode(roomCode);
      setSettings(settings);
      setIsSinglePlayer(!!isSinglePlayer);
    });
    socket.on("disconnect", () => {
      setRoomCode("");
    });
    socket.on("roomError", (error: string) => {
      console.error(error);
      setRoomCode("");
      toast({
        variant: "destructive",
        description: (
          <>
            <TriangleAlert className="tw:inline tw:mr-2" /> {error}
          </>
        ),
      });
      setSearchParams();
    });
    socket.on("opponentJoined", () => {
      setIsOpponentConnected(true);
    });

    return () => {
      socket.off("roomCode");
      socket.off("disconnect");
      socket.off("roomError");
      socket.off("opponentJoined");
    };
  }, [setSearchParams, socket]);

  useEffect(() => {
    const roomCode = searchParams.get("roomCode");
    if (roomCode) {
      socket.emit("join", roomCode);
      setSearchParams();
    }
  }, []);

  useEffect(() => {
    if (roomCode) return;
    setIsOpponentConnected(false);
  }, [roomCode]);

  useEffect(() => {
    return () => {
      if (roomCode) {
        socket.emit("leave", roomCode);
      }
    };
  }, [roomCode]);

  return (
    <>
      {roomCode && socket ? (
        isSinglePlayer || isOpponentConnected ? (
          <GameScreen exitRoom={exitRoom} />
        ) : (
          <WaitingLobby roomCode={roomCode} exitRoom={exitRoom} />
        )
      ) : (
        <PokeChainLobby />
      )}
    </>
  );
};

export const Component = () => (
  <PokeChainContextProvider>
    <PokeChain />
  </PokeChainContextProvider>
);

Component.displayName = "PokeChain";

export default Component;
