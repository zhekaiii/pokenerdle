import { PokemonWithAbilities } from "@pokenerdle/shared";
import { uniqBy } from "es-toolkit";

export const MAX_LINKS = 3;

export const getSharedAbilities = (
  pokemon1: PokemonWithAbilities,
  pokemon2: PokemonWithAbilities
) => {
  return uniqBy(
    pokemon1.abilities.filter((ability1) =>
      pokemon2.abilities.some((ability2) => ability1.name === ability2.name)
    ),
    (ability) => ability.name
  );
};

export const updateSharedLinks = (
  pokemon1: PokemonWithAbilities,
  pokemon2: PokemonWithAbilities,
  sharedLinks: Record<string, number>
) => {
  const sharedAbilities = getSharedAbilities(pokemon1, pokemon2);
  sharedAbilities.forEach((ability) => {
    sharedLinks[ability.name] = Math.min(
      (sharedLinks[ability.name] || 0) + 1,
      MAX_LINKS
    );
  });
};
