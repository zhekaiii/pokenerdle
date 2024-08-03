import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import api from "../../api";
import PageContainer from "../../layout/PageContainer";
import BattleScreen from "./BattleScreen";
import Home from "./Home";
import WaitingForOpponent from "./WaitingForOpponent";

const LinkBattle: React.FC = () => {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [isOpponentConnected, setIsOpponentConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      setSocket(api.battles.connect(setRoomCode, setIsOpponentConnected));
      return;
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
    </PageContainer>
  );
};

export default LinkBattle;
