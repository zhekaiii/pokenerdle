import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import React from "react";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- prefer type aliases
type PokemonRevealProps = {
  pokemonId: number;
};

const PokemonReveal: React.FC<PokemonRevealProps> = ({ pokemonId }) => {
  const { getPokemonIcon } = usePokemonIcons();
  const pokemonNames = usePokemonNames();
  const entry = pokemonNames[pokemonId];
  const displayName = entry?.name || entry?.speciesName || `#${pokemonId}`;

  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:gap-2 tw:py-4">
      <img
        src={getPokemonIcon(pokemonId)}
        alt={displayName}
        className="tw:w-32 tw:h-32 tw:object-contain"
        loading="eager"
      />
      <div className="tw:text-2xl tw:font-semibold tw:capitalize">
        {displayName}
      </div>
      <div className="tw:text-sm tw:text-muted-foreground">
        #{pokemonId.toString().padStart(4, "0")}
      </div>
    </div>
  );
};

export default PokemonReveal;
