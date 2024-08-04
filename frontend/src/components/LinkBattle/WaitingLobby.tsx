import CloseIcon from "@mui/icons-material/Close";
import { Button, debounce, IconButton } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { Socket } from "socket.io-client";
import classes from "./WaitingLobby.module.scss";

type Props = {
  roomCode: string;
  socket: Socket;
};

const WaitingLobby: React.FC<Props> = ({ socket, roomCode }) => {
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

  const exitWaitingRoom = () => {
    socket.close();
  };

  return (
    <div className={classes["WaitingLobby__Card"]}>
      <IconButton
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        onClick={exitWaitingRoom}
        color="inherit"
      >
        <CloseIcon />
      </IconButton>
      <span className={classes["WaitingLobby__CardTitle"]}>
        Waiting for opponent to join room {"\n"}
        {roomCode}
      </span>
      <Button onClick={onClickButton} variant="outlined" color="inherit">
        {buttonLabel}
      </Button>
    </div>
  );
};

export default WaitingLobby;
