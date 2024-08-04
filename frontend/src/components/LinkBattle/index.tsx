import { Alert, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import api from "../../api";
import { BattleRoomSettings } from "../../api/battles/types";
import PageContainer from "../../layout/PageContainer";
import GameScreen from "./GameScreen";
import LinkBattleLobby from "./LinkBattleLobby";
import WaitingLobby from "./WaitingLobby";

const LinkBattle: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket>();

  const [isOpponentConnected, setIsOpponentConnected] = useState(false);
  const [settings, setSettings] = useState<BattleRoomSettings>({
    timer: 20,
    showAbility: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const createSocket = () => {
    if (socket) {
      return socket;
    }
    const createdSocket = api.battles.connect(
      (roomCode, settings = { timer: 20, showAbility: true }) => {
        setRoomCode(roomCode);
        setSettings(settings);
      },
      setIsOpponentConnected,
      (error) => {
        setError(error);
        setIsSnackbarOpen(true);
        setSearchParams();
      },
      setSocket
    );
    setSocket(createdSocket);
    return createdSocket;
  };

  // This runs twice on dev because of React strict mode, so it errors out
  // because backend thinks that a third player is trying to join
  useEffect(() => {
    if (searchParams.get("roomCode")) {
      const socket = createSocket();
      socket.emit("join", searchParams.get("roomCode"));
    }
    return () => {
      socket?.disconnect();
    };
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
          <GameScreen socket={socket} roomCode={roomCode} settings={settings} />
        ) : (
          <WaitingLobby roomCode={roomCode} socket={socket} />
        )
      ) : (
        <LinkBattleLobby
          socket={socket}
          setIsOpponentConnected={setIsOpponentConnected}
          createSocket={createSocket}
        />
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
