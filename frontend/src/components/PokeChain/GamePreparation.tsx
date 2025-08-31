import { Button } from "@/components/ui/Button";
import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../../hooks/useSocket";
import classes from "./GamePreparation.module.scss";
import GameSettings from "./GameSettings";
import {
  getOpponentDisplayName,
  getYourOpponentDisplayName,
  usePokeChainContext,
} from "./context/PokeChainContext";

interface Props {
  isGoingFirst?: boolean;
  exitRoom: () => void;
}

const GamePreparation: React.FC<Props> = ({ isGoingFirst, exitRoom }) => {
  const socket = useSocket();
  const { settings, isSinglePlayer, opponentDisplayName } =
    usePokeChainContext();
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [isReady, setIsReady] = useState(false);
  const [isOpponentReady, setIsOpponentReady] = useState(false);

  const onReady = useCallback(() => {
    if (isReady) return;
    setIsReady(true);
    socket.emit("ready");
  }, [isReady, socket]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only want to run on secondsLeft change
  }, [secondsLeft]);

  useEffect(() => {
    socket.on("ready", (socketId: string) => {
      if (socketId !== socket.id) {
        setIsOpponentReady(true);
      }
    });
    return () => {
      socket.off("ready");
    };
  });

  return (
    <div className={classes.GamePreparation}>
      {!isSinglePlayer && isGoingFirst !== undefined && (
        <div>
          {isGoingFirst
            ? "You"
            : getYourOpponentDisplayName(opponentDisplayName)}{" "}
          will go first
        </div>
      )}

      <GameSettings settings={settings} />

      <div className="tw:flex tw:flex-row tw:space-x-2 tw:items-start">
        <Button
          className={classes.GamePreparation__Buttons}
          onClick={exitRoom}
          variant="secondary"
        >
          Close
        </Button>
        <div className="tw:flex tw:flex-col tw:text-center">
          <Button
            className={classes.GamePreparation__Buttons}
            onClick={onReady}
            disabled={isReady}
          >
            Ready ({secondsLeft})
          </Button>
          {isOpponentReady && (
            <small className="tw:mt-2">
              {getOpponentDisplayName(opponentDisplayName)} is ready
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePreparation;
