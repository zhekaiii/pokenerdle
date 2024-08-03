import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import api from "../../api";
import PageContainer from "../../layout/PageContainer";
import BattleScreen from "./BattleScreen";
import Home from "./Home";

const LinkBattle: React.FC = () => {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [isOpponentConnected, setIsOpponentConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      setSocket(api.battles.connect(setRoomCode));
      return;
    }
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <PageContainer>
      {socket?.id}
      {roomCode ? <BattleScreen /> : <Home socket={socket} />}
    </PageContainer>
  );
};

export default LinkBattle;
