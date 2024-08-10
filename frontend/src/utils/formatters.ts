import { Pokemon } from "pokeapi-js-wrapper";

export const formatAbilityName = (abilityName: string) => {
  return abilityName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getFormattedPokemonName = (pokemon: Pokemon) => {
  const megaMatch = pokemon.name.match(/^(.*)-mega(?:-(.+))?$/);
  if (megaMatch) {
    const [_, pokemonName, form] = megaMatch;
    return `Mega ${pokemonName[0].toUpperCase() + pokemonName.slice(1)} ${
      form ?? ""
    }`.trim();
  }
  const speciesName = pokemon.species.name;
  return speciesName[0].toUpperCase() + speciesName.slice(1);
};
