import { Button, Divider, OutlinedInput } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import api from "../../api";
import LoadingDialog from "../recyclables/LoadingDialog";
import GameSettings from "./GameSettings";
import classes from "./LinkBattleLobby.module.scss";

type Props = {
  socket?: Socket;
  setIsOpponentConnected: (isConnected: boolean) => void;
  createSocket: () => Socket;
};

const MAX_ROOM_CODE_LENGTH = 8;
const LinkBattleLobby: React.FC<Props> = ({
  socket,
  setIsOpponentConnected,
  createSocket,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [showAbility, setShowAbility] = useState(true);
  const [timer, setTimer] = useState(20);

  useEffect(() => {
    if (!socket) return;
    const hideLoadingDialog = () => {
      setIsConnecting(false);
    };
    hideLoadingDialog();
    socket.on("roomError", hideLoadingDialog);
    return () => {
      socket.off("roomError", hideLoadingDialog);
    };
  }, [socket]);

  const onClickCreate = async () => {
    if (isConnecting) return;
    const socket = createSocket();
    setIsConnecting(true);
    api.battles.createBattleRoom(socket!, { timer, showAbility });
  };

  const onClickJoin = async () => {
    if (isConnecting || roomCodeInput.length !== MAX_ROOM_CODE_LENGTH) return;
    const socket = createSocket();
    setIsConnecting(true);
    setIsOpponentConnected(true);
    api.battles.joinRoom(socket!, roomCodeInput);
  };

  return (
    <div className={classes.LinkBattleLobby}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onClickJoin();
        }}
      >
        <OutlinedInput
          fullWidth
          placeholder="Room Code"
          disabled={isConnecting}
          value={roomCodeInput}
          onChange={(e) =>
            setRoomCodeInput(
              e.target.value.substring(0, MAX_ROOM_CODE_LENGTH).toUpperCase()
            )
          }
          spellCheck={false}
          autoComplete="off"
        />
      </form>
      <Button variant="contained" disabled={isConnecting} onClick={onClickJoin}>
        Join Room
      </Button>
      <Divider>Or</Divider>
      <Button
        variant="contained"
        disabled={isConnecting}
        onClick={onClickCreate}
      >
        Create Room
      </Button>

      <GameSettings
        settings={{ showAbility, timer }}
        setTimer={setTimer}
        setShowAbility={setShowAbility}
      />

      <LoadingDialog open={isConnecting} />
    </div>
  );
};

export default LinkBattleLobby;
