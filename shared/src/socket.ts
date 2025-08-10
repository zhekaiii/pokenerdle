import { BattleRoomSettings, ForfeitInfo } from "./battle.js";
import { WrongAnswerReason } from "./index.js";
import { PokemonNamesResponse, PokemonWithAbilities } from "./pokemon.js";

export interface ServerToClientEvents {
  roomCode: (
    roomCode: string,
    settings: BattleRoomSettings,
    isSinglePlayer?: boolean
  ) => void;
  roomError: (error: string) => void;
  opponentJoined: () => void;
  wrongAnswer: (data: {
    pokemonId: number;
    points: number;
    player: string;
    reason: WrongAnswerReason;
  }) => void;
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
  gameEnd: (data: {
    forfeitInfo?: ForfeitInfo;
    points: Record<string, number>;
  }) => void;
  rematch: (
    socketId: string,
    readyToStart: boolean,
    starterPokemon: PokemonWithAbilities
  ) => void;
}

export interface ClientToServerEvents {
  create: (params: {
    settings: BattleRoomSettings;
    isSinglePlayer?: boolean;
  }) => void;
  join: (roomId: string) => void;
  answer: (pokemon: PokemonNamesResponse, roomId: string) => void;
  leave: (roomId: string, callback?: () => void) => void;
  disconnecting: () => void;
  isMyTurn: (callback: (isTurn: boolean) => void) => void;
  ready: () => void;
  rematch: () => void;
  forfeit: () => void;
}
