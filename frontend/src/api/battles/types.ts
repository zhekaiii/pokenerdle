import { PokemonWithAbilities } from "@pokenerdle/shared";

export type PokemonGuess = PokemonWithAbilities & {
  isSameEvoline?: boolean;
  guessedBy?: string;
};
