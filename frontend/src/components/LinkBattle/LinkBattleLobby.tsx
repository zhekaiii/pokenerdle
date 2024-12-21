import { Add, GroupOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  OutlinedInput,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import api from "../../api";
import { useSocket } from "../../hooks/useSocket";
import LoadingDialog from "../recyclables/LoadingDialog";
import GameSettings from "./GameSettings";
import classes from "./LinkBattleLobby.module.scss";

enum TabValue {
  JOIN = "join",
  CREATE = "create",
}

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
  const [tabValue, setTabValue] = useState(TabValue.JOIN);

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

  const joinRoomSection = (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onClickJoin();
        }}
      >
        <OutlinedInput
          className="tw-my-2"
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
    </>
  );

  const createRoomSection = (
    <>
      <GameSettings
        settings={{ showAbility, timer }}
        setTimer={setTimer}
        setShowAbility={setShowAbility}
      />
      <Button
        className="!tw-mt-2"
        variant="contained"
        disabled={isConnecting}
        onClick={onClickCreate}
      >
        Create Room
      </Button>
    </>
  );

  return (
    <Card className={classes.LinkBattleLobby} variant="outlined">
      <CardContent className={classes.LinkBattleLobby__Contents}>
        <Typography align="center" variant="h4">
          Pokémon Link Battle
        </Typography>
        <Typography align="center" color="textSecondary">
          Challenge your friends in a Pokémon chain battle!
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(_, value) => setTabValue(value)}
          variant="fullWidth"
          centered
        >
          <Tab
            value={TabValue.JOIN}
            icon={<GroupOutlined />}
            label="Join Room"
          ></Tab>
          <Tab value={TabValue.CREATE} icon={<Add />} label="Create Room"></Tab>
        </Tabs>

        {tabValue === TabValue.JOIN ? joinRoomSection : createRoomSection}

        <LoadingDialog open={isConnecting} />
      </CardContent>
    </Card>
  );
};

export default LinkBattleLobby;
