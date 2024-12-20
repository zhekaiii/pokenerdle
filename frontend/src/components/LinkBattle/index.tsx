import { Alert, Snackbar } from "@mui/material";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [roomCode, setRoomCode] = useState<string | null>(null);

  const [isOpponentConnected, setIsOpponentConnected] = useState(false);
  const [settings, setSettings] = useState<BattleRoomSettings>({
    timer: 20,
    showAbility: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

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
      setError(error);
      setIsSnackbarOpen(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to run this once
  }, []);

  useEffect(() => {
    if (roomCode) return;
    setIsOpponentConnected(false);
  }, [roomCode]);

  return (
    <PageContainer>
      {roomCode && socket ? (
        isOpponentConnected ? (
          <GameScreen roomCode={roomCode} settings={settings} />
        ) : (
          <WaitingLobby roomCode={roomCode} />
        )
      ) : (
        <LinkBattleLobby setIsOpponentConnected={setIsOpponentConnected} />
      )}

      <Snackbar
        open={isSnackbarOpen}
        onClose={() => setIsSnackbarOpen(false)}
        autoHideDuration={3000}
      >
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default LinkBattle;
