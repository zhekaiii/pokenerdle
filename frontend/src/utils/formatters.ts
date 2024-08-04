export const formatAbilityName = (abilityName: string) => {
  return abilityName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
