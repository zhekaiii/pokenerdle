import React, { useState } from "react";
import PageContainer from "../../layout/PageContainer";
import BattleScreen from "./BattleScreen";
import Home from "./Home";

const LinkBattle: React.FC = () => {
  const [roomCode, setRoomCode] = useState<string | null>(null);

  return (
    <PageContainer>
      {roomCode ? <BattleScreen /> : <Home setRoomCode={setRoomCode} />}
    </PageContainer>
  );
};

export default LinkBattle;
