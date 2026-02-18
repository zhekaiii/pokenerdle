import {
  BattleRoomSettings,
  ForfeitInfo,
  PokemonWithAbilities,
  WrongAnswerReason,
} from "@pokenerdle/shared";
import { pokemon_v2_pokemonspecies } from "../generated/prisma-sqlite/client.js";

export type BattleRoom = {
  players: [string] | [string, string];
  displayNames: [string | null] | [string | null, string | null];
  pokemon: PokemonWithAbilities[];
  settings: BattleRoomSettings;
  turn: number;
  turnStart: number;
  gameStartTime: number;
  timer: NodeJS.Timeout | null;
  readyPlayers: string[];
  wantToRematch: string[];
  usedLinks: Record<string, number>;
  evolutionLinkCount: [number, number];
  points: [number, number];
  streak: [number, number];
  maxStreak: [number, number];
  forfeitInfo?: ForfeitInfo;
  numPlayers: 1 | 2;
};

export type TurnResult = InvalidAnswer | ValidAnswer;

export type InvalidAnswer = {
  validAnswer: false;
  pokemonId: number;
  reason: WrongAnswerReason;
};
export type ValidAnswer = {
  validAnswer: true;
  pokemon: PokemonWithAbilities;
  species: pokemon_v2_pokemonspecies | null;
  sameSpecies: number[];
  usedLinks: string[];
  isSameEvoline: boolean;
};
