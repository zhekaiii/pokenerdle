export const formatAbilityName = (abilityName: string) => {
  return abilityName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getFormattedPokemonName = (pokemon: {
  name: string;
  speciesName: string;
}) => {
  const megaMatch = pokemon.name.match(/^(.*)-mega(?:-(.+))?$/);
  if (megaMatch) {
    const [_, pokemonName, form] = megaMatch;
    return `Mega ${pokemonName[0].toUpperCase() + pokemonName.slice(1)} ${
      form ?? ""
    }`.trim();
  }
  const speciesName = pokemon.speciesName;
  return speciesName[0].toUpperCase() + speciesName.slice(1);
};

export const formatPokemonHeight = (height: number | null) =>
  `${((height ?? 0) / 10).toFixed(1)} m`;
