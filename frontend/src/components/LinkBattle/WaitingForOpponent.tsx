import React from "react";

type Props = {
  roomCode: string;
};

const WaitingForOpponent: React.FC<Props> = ({ roomCode }) => {
  return (
    <div>
      <h1>Waiting for opponent to join room {roomCode}</h1>
    </div>
  );
};

export default WaitingForOpponent;
