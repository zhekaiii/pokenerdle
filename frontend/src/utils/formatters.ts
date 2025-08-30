export const formatAbilityName = (abilityName: string) => {
  return abilityName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatPokemonHeight = (height: number | null) =>
  ((height ?? 0) / 10).toFixed(1);
