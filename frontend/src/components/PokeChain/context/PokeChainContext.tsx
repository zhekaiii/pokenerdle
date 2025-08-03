import { BattleRoomSettings, PokemonWithAbilities } from "@pokenerdle/shared";
import React, { createContext, ReactNode, useContext, useState } from "react";

type PokeChainContextType = {
  settings: BattleRoomSettings;
  roomCode: string | null;
  isOpponentConnected: boolean;
  isSinglePlayer: boolean;
  setSettings: React.Dispatch<React.SetStateAction<BattleRoomSettings>>;
  setRoomCode: React.Dispatch<React.SetStateAction<string | null>>;
  setIsOpponentConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSinglePlayer: React.Dispatch<React.SetStateAction<boolean>>;
  starterPokemon: PokemonWithAbilities | null;
  setStarterPokemon: React.Dispatch<
    React.SetStateAction<PokemonWithAbilities | null>
  >;
};

const PokeChainContext = createContext<PokeChainContextType | undefined>(
  undefined
);

export const usePokeChainContext = () => {
  const context = useContext(PokeChainContext);
  if (!context) {
    throw new Error(
      "usePokeChainContext must be used within a PokeChainProvider"
    );
  }
  return context;
};

type PokeChainContextProviderProps = {
  children: ReactNode;
};

export const PokeChainContextProvider: React.FC<
  PokeChainContextProviderProps
> = ({ children }) => {
  const [settings, setSettings] = useState<BattleRoomSettings>({
    timer: 20,
    showAbility: true,
  });
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isOpponentConnected, setIsOpponentConnected] = useState(false);
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);
  const [starterPokemon, setStarterPokemon] =
    useState<PokemonWithAbilities | null>(null);

  const value = {
    settings,
    roomCode,
    isOpponentConnected,
    isSinglePlayer,
    setSettings,
    setRoomCode,
    setIsOpponentConnected,
    setIsSinglePlayer,
    starterPokemon,
    setStarterPokemon,
  };

  return (
    <PokeChainContext.Provider value={value}>
      {children}
    </PokeChainContext.Provider>
  );
};
