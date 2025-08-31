import React, { useCallback, useEffect, useState } from "react";
import api from "../../api";
import { useSocket } from "../../hooks/useSocket";
import BattleScreen from "./BattleScreen";
import GamePreparation from "./GamePreparation";
import { usePokeChainContext } from "./context/PokeChainContext";

interface Props {
  exitRoom: () => void;
}

const GameScreen: React.FC<Props> = ({ exitRoom }) => {
  const socket = useSocket();
  const { roomCode, starterPokemon, setStarterPokemon } = usePokeChainContext();
  const [isGoingFirst, setIsGoingFirst] = useState<boolean>();
  const [isGameStarted, setIsGameStarted] = useState(false);

  const goBackToPreparation = useCallback(() => {
    socket.emit("isMyTurn", setIsGoingFirst);
    setIsGameStarted(false);
  }, [socket]);

  useEffect(() => {
    if (!roomCode) return;
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
    <GamePreparation isGoingFirst={isGoingFirst} exitRoom={exitRoom} />
  ) : (
    <BattleScreen
      isGoingFirst={isGoingFirst}
      starterPokemon={starterPokemon}
      goBackToPreparation={goBackToPreparation}
      exitRoom={exitRoom}
    />
  );
};

export default GameScreen;
