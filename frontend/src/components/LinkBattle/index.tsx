import { useToast } from "@/hooks/useToast";
import { TriangleAlert } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { BattleRoomSettings } from "../../api/battles/types";
import { useSocket } from "../../hooks/useSocket";
import PageContainer from "../../layout/PageContainer";
import GameScreen from "./GameScreen";
import LinkBattleLobby from "./LinkBattleLobby";
import WaitingLobby from "./WaitingLobby";

const LinkBattle: React.FC = () => {
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
      socket.removeAllListeners();
    });
    socket.on("roomError", (error: string) => {
      console.error(error);
      setRoomCode("");
      toast({
        variant: "destructive",
        description: (
          <>
            <TriangleAlert className="tw-inline tw-mr-2" /> {error}
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
    if (searchParams.get("roomCode")) {
      socket.emit("join", searchParams.get("roomCode"));
      setSearchParams();
    }
  }, []);

  useEffect(() => {
    if (roomCode) return;
    setIsOpponentConnected(false);
  }, [roomCode]);

  return (
    <PageContainer>
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
        <LinkBattleLobby setIsOpponentConnected={setIsOpponentConnected} />
      )}
    </PageContainer>
  );
};

export default LinkBattle;
