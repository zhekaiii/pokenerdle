import {
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  OutlinedInput,
  Slider,
  Stack,
  Switch,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import api from "../../api";
import LoadingDialog from "../recyclables/LoadingDialog";
import classes from "./LinkBattleHome.module.scss";

type Props = {
  socket?: Socket;
};

const MAX_ROOM_CODE_LENGTH = 8;
const MAX_TIMER = 90;
const MIN_TIMER = 5;

const LinkBattleHome: React.FC<Props> = ({ socket }) => {
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
    api.battles.joinRoom(socket, roomCodeInput);
  };

  return (
    <div className={classes.LinkBattleHome}>
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

      <FormGroup className={classes.LinkBattleHome__Settings}>
        <div>
          Time per turn
          <Stack direction="row" spacing={2}>
            <Slider
              value={timer}
              max={MAX_TIMER}
              min={MIN_TIMER}
              onChange={(e, value) => setTimer(value as number)}
            />
            <span>{timer} seconds</span>
          </Stack>
        </div>
        <FormControlLabel
          control={
            <Switch
              checked={showAbility}
              onChange={(e, checked) => setShowAbility(checked)}
            />
          }
          label="Show abilities"
          labelPlacement="start"
        ></FormControlLabel>
      </FormGroup>
      <LoadingDialog open={isConnecting} />
    </div>
  );
};

export default LinkBattleHome;
