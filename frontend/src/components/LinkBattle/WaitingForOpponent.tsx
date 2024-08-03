import { Button, debounce } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import classes from "./WaitingForOpponent.module.scss";

type Props = {
  roomCode: string;
};

const WaitingForOpponent: React.FC<Props> = ({ roomCode }) => {
  const [buttonLabel, setButtonLabel] = useState("Copy invite link");
  const shareLink = useMemo(() => {
    const url = new URL(location.href);
    url.searchParams.set("roomCode", roomCode);
    return url.toString();
  }, [roomCode]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- there are no unknown dependencies
  const resetButtonLabel = useCallback(
    debounce(() => {
      setButtonLabel("Copy invite link");
    }, 4000),
    [setButtonLabel]
  );

  const onClickButton = () => {
    navigator.clipboard.writeText(shareLink);
    setButtonLabel("Copied!");
    resetButtonLabel();
  };
  return (
    <div className={classes["WaitingForOpponent__Card"]}>
      <span className={classes["WaitingForOpponent__CardTitle"]}>
        Waiting for opponent to join room {roomCode}
      </span>
      <Button onClick={onClickButton} variant="outlined" color="inherit">
        {buttonLabel}
      </Button>
    </div>
  );
};

export default WaitingForOpponent;
