import { uniqBy } from "es-toolkit";
import { Pokemon } from "pokeapi-js-wrapper";

const MAX_LINKS = 3;

export const getSharedAbilities = (pokemon1: Pokemon, pokemon2: Pokemon) => {
  return uniqBy(
    pokemon1.abilities.filter((ability1) =>
      pokemon2.abilities.some(
        (ability2) => ability1.ability.name === ability2.ability.name
      )
    ),
    (ability) => ability.ability.name
  );
};

export const updateSharedLinks = (
  pokemon1: Pokemon,
  pokemon2: Pokemon,
  sharedLinks: Record<string, number>
) => {
  const sharedAbilities = getSharedAbilities(pokemon1, pokemon2);
  sharedAbilities.forEach(({ ability }) => {
    sharedLinks[ability.name] = Math.min(
      (sharedLinks[ability.name] || 0) + 1,
      MAX_LINKS
    );
  });
};
