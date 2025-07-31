import { PokemonWithAbilities } from "@pokenerdle/shared";

export const MAX_ABILITY_LINKS = 3;
export const MAX_EVOLUTION_LINKS = 3;

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
  evolutionLinkCount: [number, number];
  points: [number, number];
};

export type TurnResult =
  | {
      validAnswer: false;
      pokemonId: number;
    }
  | {
      validAnswer: true;
      pokemon: PokemonWithAbilities;
      sameSpecies: number[];
      usedLinks: string[];
      isSameEvoline: boolean;
    };
