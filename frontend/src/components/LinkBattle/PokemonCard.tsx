import { Paper } from "@mui/material";
import { uniqBy } from "lodash";
import { Pokemon } from "pokeapi-js-wrapper";
import React, { useMemo } from "react";
import {
  formatAbilityName,
  getFormattedPokemonName,
} from "../../utils/formatters";
import classes from "./PokemonCard.module.scss";

type Props = {
  pokemon: Pokemon;
  showAbility: boolean;
};

const SHINY_PROBABILITY = 1 / 2 ** 13;

const PokemonCard: React.FC<Props> = ({ pokemon, showAbility }) => {
  const isShiny = useMemo(() => Math.random() <= SHINY_PROBABILITY, []);
  const abilities = useMemo(
    () => uniqBy(pokemon.abilities, "ability.name"),
    [pokemon]
  );
  const pokemonNumber = useMemo(() => {
    const speciesUrl = pokemon.species.url;
    return speciesUrl.match(/.*\/(\d+)/)?.[1].padStart(3, "0");
  }, [pokemon]);
  return (
    <Paper className={classes["PokemonCard"]} elevation={3}>
      <img
        src={
          (isShiny && pokemon.sprites.front_shiny
            ? pokemon.sprites.front_shiny
            : pokemon.sprites.front_default) ?? ""
        }
        alt={pokemon.name}
      />

      <span className={classes["PokemonCard__PkmnName"]}>
        #{pokemonNumber} {getFormattedPokemonName(pokemon)} {isShiny && "✨"}
      </span>
      {showAbility &&
        abilities.map(({ ability }) => (
          <span key={ability.name}>{formatAbilityName(ability.name)}</span>
        ))}
    </Paper>
  );
};

export default PokemonCard;
