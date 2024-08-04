import { Button, Stack } from "@mui/material";
import React, { useCallback, useState } from "react";
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

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (secondsLeft <= 1) {
  //       onReady();
  //       clearInterval(interval);
  //     }
  //     setSecondsLeft((prev) => prev - 1);
  //   }, 1000);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [secondsLeft]);

  return (
    <div className={classes.GamePreparation}>
      {isGoingFirst !== undefined && (
        <div>{isGoingFirst ? "You" : "Your opponent"} will go first</div>
      )}

      <GameSettings settings={settings} />

      <Stack direction="row" spacing={2}>
        <Button
          className={classes.GamePreparation__Buttons}
          variant="contained"
          onClick={() => socket.close()}
          color="secondary"
        >
          Close
        </Button>
        <Button
          className={classes.GamePreparation__Buttons}
          variant="contained"
          onClick={onReady}
          disabled={isReady}
        >
          Ready ({secondsLeft})
        </Button>
      </Stack>
    </div>
  );
};

export default GamePreparation;
