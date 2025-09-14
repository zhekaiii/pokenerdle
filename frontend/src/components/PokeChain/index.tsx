import { displayNameAtom } from "@/pages/Settings";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { toast } from "sonner";
import { useSocket } from "../../hooks/useSocket";
import {
  PokeChainContextProvider,
  usePokeChainContext,
} from "./context/PokeChainContext";
import GameScreen from "./GameScreen";
import PokeChainLobby from "./PokeChainLobby";
import WaitingLobby from "./WaitingLobby";

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
    setOpponentDisplayName,
  } = usePokeChainContext();
  const searchParams = useSearch({ strict: false }) as { roomCode?: string };
  const navigate = useNavigate();
  const displayName = useAtomValue(displayNameAtom);

  const exitRoom = () => {
    if (!roomCode) return;
    socket.emit("leave", roomCode, () => {
      setRoomCode(null);
      setIsOpponentConnected(false);
      setSettings({ timer: 20, showAbility: true });
      navigate({ to: ".", replace: true });
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
      toast.error(error.toString());
      navigate({ to: ".", replace: true });
    });
    socket.on("opponentJoined", (displayName: string | null) => {
      setIsOpponentConnected(true);
      setOpponentDisplayName(displayName);
    });

    return () => {
      socket.off("roomCode");
      socket.off("disconnect");
      socket.off("roomError");
      socket.off("opponentJoined");
    };
  }, [navigate, socket]);

  useEffect(() => {
    const roomCode = searchParams.roomCode;
    if (roomCode) {
      socket.emit("join", roomCode, displayName);
      navigate({ to: ".", replace: true });
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
