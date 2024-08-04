import { Pokemon } from "pokedex-promise-v2";

export type BattleRoomSettings = {
  timer: number;
  showAbility: boolean;
};

export type BattleRoom = {
  players: [string] | [string, string];
  pokemon: Pokemon[];
  settings: BattleRoomSettings;
  turn: number;
  timer: NodeJS.Timeout | null;
  readyPlayers: string[];
};
