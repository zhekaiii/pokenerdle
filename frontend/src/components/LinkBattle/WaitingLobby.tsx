import { Button } from "@/components/ui/Button";
import CloseIcon from "@mui/icons-material/Close";
import { debounce, IconButton } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import classes from "./WaitingLobby.module.scss";

type Props = {
  roomCode: string;
  exitRoom: () => void;
};

const WaitingLobby: React.FC<Props> = ({ roomCode, exitRoom }) => {
  const [buttonLabel, setButtonLabel] = useState("Copy invite link");
  const shareLink = useMemo(() => {
    const url = new URL(location.href);
    url.searchParams.set("roomCode", roomCode);
    return url.toString();
  }, [roomCode]);

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
    <div className={classes["WaitingLobby__Card"]}>
      <IconButton
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        onClick={exitRoom}
        color="inherit"
      >
        <CloseIcon />
      </IconButton>
      <span className={classes["WaitingLobby__CardTitle"]}>
        Waiting for opponent to join room {"\n"}
        {roomCode}
      </span>
      <Button onClick={onClickButton} variant="outline">
        {buttonLabel}
      </Button>
    </div>
  );
};

export default WaitingLobby;
