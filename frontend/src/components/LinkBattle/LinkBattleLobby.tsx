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
};

const MAX_ROOM_CODE_LENGTH = 8;
const LinkBattleLobby: React.FC<Props> = ({
  socket,
  setIsOpponentConnected,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [showAbility, setShowAbility] = useState(true);
  const [timer, setTimer] = useState(20);

  useEffect(() => {
    if (!socket) return;
    socket.on("roomError", () => {
      setIsConnecting(false);
    });
  }, [socket]);

  const onClickCreate = async () => {
    if (isConnecting || !socket) return;
    setIsConnecting(true);
    api.battles.createBattleRoom(socket, { timer, showAbility });
  };

  const onClickJoin = async () => {
    if (isConnecting || !socket) return;
    setIsConnecting(true);
    setIsOpponentConnected(true);
    api.battles.joinRoom(socket, roomCodeInput);
  };

  return (
    <div className={classes.LinkBattleLobby}>
      <OutlinedInput
        placeholder="Room Code"
        disabled={isConnecting}
        value={roomCodeInput}
        onChange={(e) =>
          setRoomCodeInput(
            e.target.value.substring(0, MAX_ROOM_CODE_LENGTH).toUpperCase()
          )
        }
      />
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
