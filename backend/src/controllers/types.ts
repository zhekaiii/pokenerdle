import {
  BattleRoomSettings,
  ForfeitInfo,
  PokemonWithAbilities,
} from "@pokenerdle/shared";
import { pokemon_v2_pokemonspecies } from "@prisma/client";

export const MAX_ABILITY_LINKS = 3;
export const MAX_EVOLUTION_LINKS = 3;

export type BattleRoom = {
  players: [string] | [string, string];
  pokemon: PokemonWithAbilities[];
  settings: BattleRoomSettings;
  turn: number;
  turnStart: number;
  timer: NodeJS.Timeout | null;
  readyPlayers: string[];
  wantToRematch: string[];
  usedLinks: Record<string, number>;
  evolutionLinkCount: [number, number];
  points: [number, number];
  streak: [number, number];
  forfeitInfo?: ForfeitInfo;
  numPlayers: 1 | 2;
};

export type TurnResult = InvalidAnswer | ValidAnswer;

export type InvalidAnswer = {
  validAnswer: false;
  pokemonId: number;
};
export type ValidAnswer = {
  validAnswer: true;
  pokemon: PokemonWithAbilities;
  species: pokemon_v2_pokemonspecies | null;
  sameSpecies: number[];
  usedLinks: string[];
  isSameEvoline: boolean;
};
