import { Button } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { BattleRoomSettings } from "../../api/battles/types";
import classes from "./GamePreparation.module.scss";
import GameSettings from "./GameSettings";

type Props = {
  socket: Socket;
  roomCode: string;
  settings: BattleRoomSettings;
  isGoingFirst?: boolean;
};

const GamePreparation: React.FC<Props> = ({
  socket,
  roomCode,
  settings,
  isGoingFirst,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(25);
  const [isReady, setIsReady] = useState(false);

  const onReady = useCallback(() => {
    if (isReady) return;
    setIsReady(true);
    socket.emit("ready", roomCode);
  }, [isReady, roomCode, socket]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((secondsLeft) => {
        if (secondsLeft <= 1) {
          onReady();
          clearInterval(interval);
        }
        return secondsLeft - 1;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to run this once
  }, []);

  return (
    <div className={classes.GamePreparation}>
      {isGoingFirst !== undefined && (
        <div>{isGoingFirst ? "You" : "Your opponent"} will go first</div>
      )}

      <GameSettings settings={settings} />

      <Button variant="contained" onClick={onReady} disabled={isReady}>
        Ready ({secondsLeft})
      </Button>
    </div>
  );
};

export default GamePreparation;
