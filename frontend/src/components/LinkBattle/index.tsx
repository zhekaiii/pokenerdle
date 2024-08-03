import { Alert, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import api from "../../api";
import PageContainer from "../../layout/PageContainer";
import BattleScreen from "./BattleScreen";
import Home from "./Home";
import WaitingForOpponent from "./WaitingForOpponent";

const LinkBattle: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [isOpponentConnected, setIsOpponentConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  useEffect(() => {
    if (!socket) {
      setSocket(
        api.battles.connect(setRoomCode, setIsOpponentConnected, (error) => {
          setError(error);
          setIsSnackbarOpen(true);
          setSearchParams();
        })
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
          <BattleScreen socket={socket} roomCode={roomCode} />
        ) : (
          <WaitingForOpponent roomCode={roomCode} />
        )
      ) : (
        <Home socket={socket} />
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
