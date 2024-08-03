import { Pokemon } from "pokeapi-js-wrapper";
import React, { useMemo } from "react";

type Props = {
  pokemon: Pokemon;
};

const SHINY_PROBABILITY = 1 / 2 ** 13;

const PokemonCard: React.FC<Props> = ({ pokemon }) => {
  const isShiny = useMemo(() => Math.random() <= SHINY_PROBABILITY, []);
  return (
    <div className="tw-flex tw-flex-col tw-items-center">
      <img
        src={
          (isShiny && pokemon.sprites.front_shiny
            ? pokemon.sprites.front_shiny
            : pokemon.sprites.front_default) ?? ""
        }
        alt={pokemon.name}
      />
      <span>{pokemon.name}</span>
      {pokemon.abilities.map(({ ability }) => (
        <span>{ability.name}</span>
      ))}
    </div>
  );
};

export default PokemonCard;
