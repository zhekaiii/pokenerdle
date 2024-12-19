import { Button, Stack, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { BattleRoomSettings } from "../../api/battles/types";
import { useSocket } from "../../hooks/useSocket";
import classes from "./GamePreparation.module.scss";
import GameSettings from "./GameSettings";

type Props = {
  roomCode: string;
  settings: BattleRoomSettings;
  isGoingFirst?: boolean;
};

const GamePreparation: React.FC<Props> = ({
  roomCode,
  settings,
  isGoingFirst,
}) => {
  const socket = useSocket();
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [isReady, setIsReady] = useState(false);
  const [isOpponentReady, setIsOpponentReady] = useState(false);

  const onReady = useCallback(() => {
    if (isReady) return;
    setIsReady(true);
    socket.emit("ready", roomCode);
  }, [isReady, roomCode, socket]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onReady();
      return;
    }
    const timeout = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't need to rerun this when onReady changes
  }, [secondsLeft]);

  useEffect(() => {
    socket.on("ready", (socketId: string) => {
      if (socketId !== socket.id) {
        setIsOpponentReady(true);
      }
    });
    return () => {
      socket.off("opponentReady");
    };
  });

  return (
    <div className={classes.GamePreparation}>
      {isGoingFirst !== undefined && (
        <div>{isGoingFirst ? "You" : "Your opponent"} will go first</div>
      )}

      <GameSettings settings={settings} />

      <Stack direction="row" spacing={2} alignItems="self-start">
        <Button
          className={classes.GamePreparation__Buttons}
          variant="contained"
          onClick={() => socket.close()}
          color="secondary"
        >
          Close
        </Button>
        <Stack textAlign="center">
          <Button
            className={classes.GamePreparation__Buttons}
            variant="contained"
            onClick={onReady}
            disabled={isReady}
          >
            Ready ({secondsLeft})
          </Button>
          {isOpponentReady && (
            <Typography variant="caption">Opponent is ready</Typography>
          )}
        </Stack>
      </Stack>
    </div>
  );
};

export default GamePreparation;
