import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Add, GroupOutlined } from "@mui/icons-material";
import { OutlinedInput } from "@mui/material";
import React, { useEffect, useState } from "react";
import api from "../../api";
import { useSocket } from "../../hooks/useSocket";
import LoadingDialog from "../recyclables/LoadingDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
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
      <Button
        disabled={isConnecting}
        onClick={onClickJoin}
        className="tw-w-full"
      >
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
        className="tw-mt-2 tw-w-full"
        disabled={isConnecting}
        onClick={onClickCreate}
      >
        Create Room
      </Button>
    </>
  );

  return (
    <Card className={classes.LinkBattleLobby}>
      <CardHeader className="tw-text-center">
        <CardTitle>Pokémon Link Battle</CardTitle>
        <CardDescription>
          Challenge your friends in a Pokémon chain battle!
        </CardDescription>
      </CardHeader>

      <CardContent className={classes.LinkBattleLobby__Contents}>
        <Tabs defaultValue={TabValue.JOIN}>
          <TabsList className="tw-w-full">
            <TabsTrigger value={TabValue.JOIN} className="tw-flex-1">
              <GroupOutlined /> Join Room
            </TabsTrigger>
            <TabsTrigger value={TabValue.CREATE} className="tw-flex-1">
              <Add /> Create Room
            </TabsTrigger>
          </TabsList>
          <TabsContent value={TabValue.JOIN}>{joinRoomSection}</TabsContent>
          <TabsContent value={TabValue.CREATE}>{createRoomSection}</TabsContent>
        </Tabs>

        <LoadingDialog open={isConnecting} />
      </CardContent>
    </Card>
  );
};

export default LinkBattleLobby;
