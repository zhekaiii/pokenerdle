import { BattleRoomSettings, PokemonWithAbilities } from "@pokenerdle/shared";
import React, { createContext, ReactNode, useContext, useState } from "react";

// Utility function to get opponent display name with fallback
export const getOpponentDisplayName = (
  displayName?: string | null,
  fallback = "Opponent"
) => {
  return displayName?.trim() || fallback;
};

// Utility function to get opponent display name with "Your" prefix and fallback
export const getYourOpponentDisplayName = (displayName?: string | null) => {
  return displayName?.trim() ? displayName.trim() : "Your opponent";
};

// Utility function to get opponent display name with proper possessive form
export const getOpponentDisplayNamePossessive = (
  displayName?: string | null,
  fallback = "Opponent"
) => {
  const name = displayName?.trim() || fallback;
  // If name ends with 's', use just apostrophe; otherwise use apostrophe + s
  return name.endsWith("s") ? `${name}'` : `${name}'s`;
};

interface PokeChainContextType {
  settings: BattleRoomSettings;
  roomCode: string | null;
  isOpponentConnected: boolean;
  isSinglePlayer: boolean;
  opponentDisplayName: string | null;
  setSettings: React.Dispatch<React.SetStateAction<BattleRoomSettings>>;
  setRoomCode: React.Dispatch<React.SetStateAction<string | null>>;
  setIsOpponentConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSinglePlayer: React.Dispatch<React.SetStateAction<boolean>>;
  setOpponentDisplayName: React.Dispatch<React.SetStateAction<string | null>>;
  starterPokemon: PokemonWithAbilities | null;
  setStarterPokemon: React.Dispatch<
    React.SetStateAction<PokemonWithAbilities | null>
  >;
}

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

interface PokeChainContextProviderProps {
  children: ReactNode;
}

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
  const [opponentDisplayName, setOpponentDisplayName] = useState<string | null>(
    null
  );
  const [starterPokemon, setStarterPokemon] =
    useState<PokemonWithAbilities | null>(null);

  const value = {
    settings,
    roomCode,
    isOpponentConnected,
    isSinglePlayer,
    opponentDisplayName,
    setSettings,
    setRoomCode,
    setIsOpponentConnected,
    setIsSinglePlayer,
    setOpponentDisplayName,
    starterPokemon,
    setStarterPokemon,
  };

  return (
    <PokeChainContext.Provider value={value}>
      {children}
    </PokeChainContext.Provider>
  );
};
