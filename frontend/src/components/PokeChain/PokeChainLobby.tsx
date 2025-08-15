import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { trackRoomCreated } from "@/lib/events";
import { HelpCircle, Plus, User, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../../api";
import { useSocket } from "../../hooks/useSocket";
import LoadingDialog from "../recyclables/LoadingDialog";
import { Input } from "../ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import GameSettings from "./GameSettings";
import classes from "./PokeChainLobby.module.scss";
import { usePokeChainContext } from "./context/PokeChainContext";

enum TabValue {
  JOIN = "join",
  CREATE = "create",
}

const MAX_ROOM_CODE_LENGTH = 8;
const PokeChainLobby: React.FC = () => {
  const socket = useSocket();
  const { setIsOpponentConnected } = usePokeChainContext();
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

  const onClickCreate = async (isSinglePlayer?: boolean) => {
    if (isConnecting) return;
    setIsConnecting(true);

    trackRoomCreated({
      is_single_player: !!isSinglePlayer,
      timer_duration: timer,
      show_ability: showAbility,
    });

    api.battles.createBattleRoom(
      socket!,
      {
        timer,
        showAbility,
      },
      isSinglePlayer
    );
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
        <Input
          className="tw:my-4 tw:w-full"
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
        className="tw:w-full"
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
        className="tw:mt-4 tw:w-full"
        disabled={isConnecting}
        onClick={() => onClickCreate()}
      >
        Create Room
      </Button>

      <div className="tw:mt-4 tw:pt-4 tw:border-t-2">
        <p className="tw:text-sm tw:text-center tw:mb-3 tw:text-muted-foreground">
          Or try the single player mode:
        </p>
        <Button
          variant="outline"
          className="tw:w-full"
          onClick={() => onClickCreate(true)}
        >
          <User className="tw:mr-2" />
          Single Player Mode
        </Button>
      </div>
    </>
  );

  return (
    <Card className={classes.PokeChainLobby}>
      <Button
        asChild
        className="tw:absolute tw:top-2 tw:end-2"
        variant="transparent"
        size="icon"
      >
        <Link to="/how-to-play/pokechain">
          <HelpCircle className="tw:size-6" />
        </Link>
      </Button>
      <CardHeader className="tw:text-center">
        <CardTitle className="tw:text-2xl">PokéChain</CardTitle>
        <CardDescription>
          Challenge your friends in a Pokémon chain battle!
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={TabValue.JOIN}>
          <TabsList className="tw:w-full">
            <TabsTrigger value={TabValue.JOIN} className="tw:flex-1">
              <Users className="tw:mr-2" /> Join Room
            </TabsTrigger>
            <TabsTrigger value={TabValue.CREATE} className="tw:flex-1">
              <Plus className="tw:mr-2" /> Create Room
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

export default PokeChainLobby;
