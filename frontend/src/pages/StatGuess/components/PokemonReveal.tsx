import api from "@/api";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import { QUERY_KEY } from "@/lib/query";
import { resolveSpriteUrl } from "@/utils/pokemonSprites";
import { useQuery } from "@tanstack/react-query";
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

  const { data: pokemon } = useQuery({
    queryKey: [QUERY_KEY.POKEMON, pokemonId],
    queryFn: () => api.data.getPokemonWithAbilities(pokemonId),
    staleTime: Infinity,
  });

  const spriteUrl = pokemon
    ? resolveSpriteUrl(pokemon)
    : getPokemonIcon(pokemonId);

  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:gap-2 tw:py-4">
      <img
        src={spriteUrl}
        alt={displayName}
        className="tw:w-32 tw:h-32 tw:object-contain"
        loading="eager"
      />
      <div className="tw:text-2xl tw:font-semibold tw:capitalize">
        {displayName}
      </div>
      <div className="tw:text-sm tw:text-muted-foreground">
        #{(pokemon?.pokemon_species_id ?? pokemonId).toString().padStart(4, "0")}
      </div>
    </div>
  );
};

export default PokemonReveal;
