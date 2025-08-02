import { useToast } from "@/hooks/useToast";
import { BattleRoomSettings } from "@pokenerdle/shared";
import { TriangleAlert } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useSocket } from "../../hooks/useSocket";
import GameScreen from "./GameScreen";
import PokeChainLobby from "./PokeChainLobby";
import WaitingLobby from "./WaitingLobby";

const PokeChain: React.FC = () => {
  const socket = useSocket();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [roomCode, setRoomCode] = useState<string | null>(null);

  const [isOpponentConnected, setIsOpponentConnected] = useState(false);
  const [settings, setSettings] = useState<BattleRoomSettings>({
    timer: 20,
    showAbility: true,
  });

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
    socket.on(
      "roomCode",
      (roomCode, settings = { timer: 20, showAbility: true }) => {
        setRoomCode(roomCode);
        setSettings(settings);
      }
    );
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

  return (
    <>
      {roomCode && socket ? (
        isOpponentConnected ? (
          <GameScreen
            roomCode={roomCode}
            settings={settings}
            exitRoom={exitRoom}
          />
        ) : (
          <WaitingLobby roomCode={roomCode} exitRoom={exitRoom} />
        )
      ) : (
        <PokeChainLobby setIsOpponentConnected={setIsOpponentConnected} />
      )}
    </>
  );
};

export default PokeChain;
