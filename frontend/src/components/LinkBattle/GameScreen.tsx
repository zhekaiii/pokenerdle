import { PokemonWithAbilities } from "@pokenerdle/shared";
import React, { useCallback, useEffect, useState } from "react";
import api from "../../api";
import { BattleRoomSettings } from "../../api/battles/types";
import { useSocket } from "../../hooks/useSocket";
import BattleScreen from "./BattleScreen";
import GamePreparation from "./GamePreparation";

type Props = {
  roomCode: string;
  settings: BattleRoomSettings;
};

const GameScreen: React.FC<Props> = ({ roomCode, settings }) => {
  const socket = useSocket();
  const [isGoingFirst, setIsGoingFirst] = useState<boolean>();
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [starterPokemon, setStarterPokemon] = useState<PokemonWithAbilities>();
  const goBackToPreparation = useCallback(() => {
    socket.emit("isMyTurn", setIsGoingFirst);
    setIsGameStarted(false);
  }, [socket]);

  useEffect(() => {
    socket.emit("isMyTurn", setIsGoingFirst);
    socket.on("startGame", () => {
      setIsGameStarted(true);
    });
    api.battles.getStarterPokemon(roomCode).then(setStarterPokemon);
    return () => {
      socket.off("startGame");
    };
  }, [socket, roomCode]);

  return !isGameStarted ||
    isGoingFirst === undefined ||
    starterPokemon == undefined ? (
    <GamePreparation
      roomCode={roomCode}
      settings={settings}
      isGoingFirst={isGoingFirst}
    />
  ) : (
    <BattleScreen
      roomCode={roomCode}
      settings={settings}
      isGoingFirst={isGoingFirst}
      starterPokemon={starterPokemon}
      goBackToPreparation={goBackToPreparation}
    />
  );
};

export default GameScreen;
