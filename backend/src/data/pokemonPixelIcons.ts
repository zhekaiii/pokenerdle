const SPRITES_REVISION = "d8eba5657870d202c17905a3d9c412a758164b66";

// Numeric PNG filenames in generation-viii/icons at the pinned revision.
// Keep this catalog with the revision so missing forms never produce 404 URLs.
const MENU_ICON_ID_RANGES = [
  [1, 898],
  [10001, 10024],
  [10026, 10092],
  [10094, 10115],
  [10117, 10117],
  [10120, 10120],
  [10123, 10127],
  [10136, 10142],
  [10146, 10148],
  [10150, 10152],
  [10155, 10176],
  [10178, 10179],
  [10181, 10185],
  [10187, 10190],
  [10192, 10192],
  [10195, 10216],
  [10218, 10218],
  [10220, 10225],
  [10227, 10227],
] as const;

export const getOriginalPokemonMenuIcon = (pokemonId: number | null) =>
  pokemonId !== null &&
  MENU_ICON_ID_RANGES.some(
    ([first, last]) => pokemonId >= first && pokemonId <= last,
  )
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/${SPRITES_REVISION}/sprites/pokemon/versions/generation-viii/icons/${pokemonId}.png`
    : undefined;
