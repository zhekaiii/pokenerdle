import { Pokemon } from "pokeapi-js-wrapper";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import api from "../../api";
import { BattleRoomSettings } from "../../api/battles/types";
import BattleScreen from "./BattleScreen";
import GamePreparation from "./GamePreparation";

type Props = {
  socket: Socket;
  roomCode: string;
  settings: BattleRoomSettings;
};

const GameScreen: React.FC<Props> = ({ socket, roomCode, settings }) => {
  const [isGoingFirst, setIsGoingFirst] = useState<boolean>();
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [starterPokemon, setStarterPokemon] = useState<Pokemon>();

  useEffect(() => {
    socket.emit("isMyTurn", setIsGoingFirst);
    socket.on("startGame", () => {
      setIsGameStarted(true);
    });
    api.battles.getStarterPokemon(roomCode).then(setStarterPokemon);
  }, [socket, roomCode]);

  return !isGameStarted ||
    isGoingFirst === undefined ||
    starterPokemon == undefined ? (
    <GamePreparation
      socket={socket}
      roomCode={roomCode}
      settings={settings}
      isGoingFirst={isGoingFirst}
    />
  ) : (
    <BattleScreen
      socket={socket}
      roomCode={roomCode}
      settings={settings}
      isGoingFirst={isGoingFirst}
      starterPokemon={starterPokemon}
    />
  );
};

export default GameScreen;
