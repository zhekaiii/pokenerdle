import { Button, Divider, OutlinedInput } from "@mui/material";
import React, { useEffect, useState } from "react";
import api from "../../api";
import { useSocket } from "../../hooks/useSocket";
import LoadingDialog from "../recyclables/LoadingDialog";
import GameSettings from "./GameSettings";
import classes from "./LinkBattleLobby.module.scss";

type Props = {
  setIsOpponentConnected: (isConnected: boolean) => void;
};

const MAX_ROOM_CODE_LENGTH = 8;
const LinkBattleLobby: React.FC<Props> = ({ setIsOpponentConnected }) => {
  const socket = useSocket();
  const [isConnecting, setIsConnecting] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [showAbility, setShowAbility] = useState(true);
  const [timer, setTimer] = useState(20);

  useEffect(() => {
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
    setIsConnecting(true);
    api.battles.createBattleRoom(socket!, { timer, showAbility });
  };

  const onClickJoin = async () => {
    if (isConnecting || roomCodeInput.length !== MAX_ROOM_CODE_LENGTH) return;
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
