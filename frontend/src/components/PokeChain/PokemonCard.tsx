import { PokemonWithAbilities } from "@pokenerdle/shared";
import { uniqBy } from "es-toolkit";
import React, { useMemo, useRef } from "react";
import {
  formatAbilityName,
  getFormattedPokemonName,
} from "../../utils/formatters";
import { Card } from "../ui/Card";
import classes from "./PokemonCard.module.scss";

type Props = {
  pokemon: PokemonWithAbilities;
  showAbility: boolean;
};

const SHINY_PROBABILITY = 1 / 2 ** 12;

const PokemonCard: React.FC<Props> = ({ pokemon, showAbility }) => {
  const { current: isShiny } = useRef(Math.random() <= SHINY_PROBABILITY);
  const abilities = useMemo(
    () => uniqBy(pokemon.abilities, (ability) => ability.name),
    [pokemon]
  );
  const pokemonNumber = pokemon.pokemon_species_id;
  return (
    <Card className={classes["PokemonCard"]}>
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
        abilities.map((ability) => (
          <span key={ability.name}>{formatAbilityName(ability.name)}</span>
        ))}
    </Card>
  );
};

export default PokemonCard;
