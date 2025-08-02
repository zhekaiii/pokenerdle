import { BattleRoomSettings } from "@pokenerdle/shared";
import { PokemonNamesResponse, PokemonWithAbilities } from "./pokemon";

export interface ServerToClientEvents {
  roomCode: (roomCode: string, settings?: BattleRoomSettings) => void;
  roomError: (error: string) => void;
  opponentJoined: () => void;
  wrongAnswer: (data: { pokemonId: number; points: number }) => void;
  pushPokemon: (
    pokemon: PokemonWithAbilities,
    socketId: string,
    sameSpecies: number[],
    isSameEvoline: boolean,
    points: number
  ) => void;
  ready: (socketId: string) => void;
  startGame: () => void;
  canMove: (socketId: string, timerEndsAt: number) => void;
  gameEnd: (data?: ForfeitInfo) => void;
  rematch: (socketId: string, bothOk: boolean) => void;
}

export interface ClientToServerEvents {
  create: (settings: BattleRoomSettings) => void;
  join: (roomId: string) => void;
  answer: (pokemon: PokemonNamesResponse, roomId: string) => void;
  leave: (roomId: string, callback?: () => void) => void;
  disconnecting: () => void;
  isMyTurn: (callback: (isTurn: boolean) => void) => void;
  ready: () => void;
  rematch: () => void;
  forfeit: () => void;
}
