import { Alert, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import api from "../../api";
import PageContainer from "../../layout/PageContainer";
import BattleScreen from "./BattleScreen";
import LinkBattleHome from "./LinkBattleHome";
import WaitingForOpponent from "./WaitingForOpponent";

const LinkBattle: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  const [isOpponentConnected, setIsOpponentConnected] = useState(false);
  const [timer, setTimer] = useState(20);
  const [showAbility, setShowAbility] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  useEffect(() => {
    if (!socket) {
      setSocket(
        api.battles.connect(
          (roomCode, settings = { timer: 20, showAbility: true }) => {
            setRoomCode(roomCode);
            setTimer(settings.timer);
            setShowAbility(settings.showAbility);
          },
          setIsOpponentConnected,
          (error) => {
            setError(error);
            setIsSnackbarOpen(true);
            setSearchParams();
          }
        )
      );
      return;
    }
    if (searchParams.get("roomCode")) {
      socket.emit("join", searchParams.get("roomCode"));
    }
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (roomCode) return;
    setIsOpponentConnected(false);
  }, [roomCode]);

  return (
    <PageContainer>
      {roomCode && socket ? (
        isOpponentConnected ? (
          <BattleScreen
            socket={socket}
            roomCode={roomCode}
            timer={timer}
            showAbility={showAbility}
          />
        ) : (
          <WaitingForOpponent roomCode={roomCode} />
        )
      ) : (
        <LinkBattleHome socket={socket} />
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
