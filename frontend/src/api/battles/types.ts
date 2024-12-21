import { PokemonWithAbilities } from "@pokenerdle/shared";

export type BattleRoomSettings = {
  timer: number;
  showAbility: boolean;
};

export type PokemonGuess = PokemonWithAbilities & {
  isSameEvoline?: boolean;
  guessedBy?: string;
};
