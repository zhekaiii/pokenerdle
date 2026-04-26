import api from "@/api";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import { QUERY_KEY } from "@/lib/query";
import { resolveSpriteUrl } from "@/utils/pokemonSprites";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface PokemonRevealProps {
  pokemonId: number;
  accuracyPercent?: number;
}

const PokemonReveal: React.FC<PokemonRevealProps> = ({
  pokemonId,
  accuracyPercent,
}) => {
  const pokemonNames = usePokemonNames();
  const entry = pokemonNames[pokemonId];
  const displayName = entry?.name || entry?.speciesName || `#${pokemonId}`;

  const { data: pokemon, isLoading } = useQuery({
    queryKey: [QUERY_KEY.POKEMON, pokemonId],
    queryFn: () => api.data.getPokemonWithAbilities(pokemonId),
    staleTime: Infinity,
  });

  const spriteUrl = pokemon && resolveSpriteUrl(pokemon);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    setImageLoaded(false);
  }, [spriteUrl]);

  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:gap-2 tw:py-4">
      <div className="tw:relative tw:size-32">
        {(isLoading || !imageLoaded) && (
          <div className="tw:absolute tw:inset-0 tw:animate-pulse tw:rounded-full tw:bg-muted" />
        )}
        {spriteUrl && (
          <img
            src={spriteUrl}
            alt={displayName}
            className="tw:size-32 tw:object-contain"
            loading="eager"
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </div>
      <div className="tw:flex tw:max-w-full tw:items-center tw:justify-center tw:gap-3">
        <div className="tw:min-w-0 tw:truncate tw:text-2xl tw:font-semibold tw:capitalize">
          {displayName}
        </div>
      </div>
      {!isLoading ? (
        pokemon && (
          <div className="tw:flex tw:items-center tw:gap-1 tw:text-sm tw:text-muted-foreground">
            <span>#{pokemon.pokemon_species_id}</span>
            {typeof accuracyPercent === "number" && (
              <>
                <span>⋅</span>
                <span className="tw:font-semibold tw:tabular-nums">
                  Accuracy: {accuracyPercent}%
                </span>
              </>
            )}
          </div>
        )
      ) : (
        <div className="tw:h-5 tw:w-16 tw:animate-pulse tw:rounded-md tw:bg-muted" />
      )}
    </div>
  );
};

export default PokemonReveal;
