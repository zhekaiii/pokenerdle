import { PokemonWithAbilities } from "@pokenerdle/shared";

export const MAX_LINKS = 3;

export type BattleRoomSettings = {
  timer: number;
  showAbility: boolean;
};

export type BattleRoom = {
  players: [string] | [string, string];
  pokemon: PokemonWithAbilities[];
  settings: BattleRoomSettings;
  turn: number;
  timer: NodeJS.Timeout | null;
  readyPlayers: string[];
  wantToRematch: string[];
  usedLinks: Record<string, number>;
};
