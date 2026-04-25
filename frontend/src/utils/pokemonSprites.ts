import questionMarkIcon from "@/assets/question_mark_big.png";
import { PokemonWithAbilities } from "@pokenerdle/shared";

/**
 * Resolves a usable sprite URL for a Pokémon, preferring the shiny variant
 * when `preferShiny` is true. Falls through the priority chain:
 *
 *   (shiny only) sprites.front_shiny
 *   (shiny only) sprites.other.home.front_shiny
 *   sprites.front_default
 *   sprites.other.home.front_default
 *   questionMarkIcon
 */
export const resolveSpriteUrl = (
  pokemon: PokemonWithAbilities,
  preferShiny = false,
): string => {
  if (preferShiny) {
    if (typeof pokemon.sprites.front_shiny === "string") {
      return pokemon.sprites.front_shiny;
    }
    if (
      typeof pokemon.sprites.other === "object" &&
      pokemon.sprites.other?.home &&
      typeof pokemon.sprites.other.home.front_shiny === "string"
    ) {
      return pokemon.sprites.other.home.front_shiny;
    }
  }
  if (pokemon.sprites.front_default) {
    return pokemon.sprites.front_default as string;
  }
  if (
    typeof pokemon.sprites.other === "object" &&
    pokemon.sprites.other?.home &&
    typeof pokemon.sprites.other.home.front_default === "string"
  ) {
    return pokemon.sprites.other.home.front_default;
  }
  return questionMarkIcon;
};
