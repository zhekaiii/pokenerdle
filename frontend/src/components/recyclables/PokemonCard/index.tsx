import questionMarkIcon from "@/assets/question_mark_big.png";
import { Button } from "@/components/ui/Button";
import { MAX_LINKS } from "@/utils/pokeChainUtils";
import { PokemonWithAbilities } from "@pokenerdle/shared";
import clsx from "clsx";
import { uniqBy } from "es-toolkit";
import { X } from "lucide-react";
import React, { useMemo, useRef } from "react";
import {
  formatAbilityName,
  getFormattedPokemonName,
} from "../../../utils/formatters";
import { Card } from "../../ui/Card";
import classes from "./index.module.scss";

type Props = {
  pokemon: PokemonWithAbilities;
  showAbility?: boolean;
  removable?: boolean;
  sharedLinks?: Record<string, number>;
  onRemove?: () => void;
};

const SHINY_PROBABILITY = 1 / 2 ** 12;

const PokemonCard: React.FC<Props> = ({
  pokemon,
  showAbility,
  removable,
  sharedLinks = {},
  onRemove,
}) => {
  const { current: isShiny } = useRef(Math.random() <= SHINY_PROBABILITY);
  const abilities = useMemo(
    () => uniqBy(pokemon.abilities, (ability) => ability.name),
    [pokemon]
  );
  const { current: timesUsed } = useRef(
    abilities.reduce((acc, ability) => {
      return {
        ...acc,
        [ability.name]: sharedLinks[ability.name] ?? 0,
      };
    }, {} as Record<string, number>)
  );
  const pokemonNumber = pokemon.pokemon_species_id;
  const pokemonSpriteUrl = useMemo(() => {
    if (isShiny) {
      if (typeof pokemon.sprites.front_shiny == "string") {
        return pokemon.sprites.front_shiny;
      }
      if (
        typeof pokemon.sprites.other == "object" &&
        pokemon.sprites.other?.home &&
        typeof pokemon.sprites.other.home.front_shiny === "string"
      ) {
        return pokemon.sprites.other.home.front_shiny;
      }
    }
    if (pokemon.sprites.front_default) {
      return pokemon.sprites.front_default;
    }
    if (
      typeof pokemon.sprites.other == "object" &&
      pokemon.sprites.other?.home &&
      typeof pokemon.sprites.other.home.front_default === "string"
    ) {
      return pokemon.sprites.other.home.front_default;
    }
    return questionMarkIcon;
  }, [isShiny, pokemon]);
  return (
    <Card className={classes["PokemonCard"]}>
      {removable && (
        <Button
          variant="transparent"
          className={classes["PokemonCard__RemoveButton"]}
          onClick={onRemove}
        >
          <X />
        </Button>
      )}
      <img
        className={classes["PokemonCard__Sprite"]}
        src={pokemonSpriteUrl}
        alt={pokemon.name}
      />

      <span className={classes["PokemonCard__PkmnName"]}>
        #{pokemonNumber} {getFormattedPokemonName(pokemon)} {isShiny && "✨"}
      </span>
      {showAbility &&
        abilities.map((ability) => {
          const usage = timesUsed[ability.name];
          return (
            <span
              className={clsx(usage === MAX_LINKS && "tw:line-through")}
              key={ability.name}
            >
              {formatAbilityName(ability.name)}{" "}
              <span className="tw:text-muted-foreground tw:text-sm">
                {usage > 0 && `${usage}/${MAX_LINKS}`}
              </span>
            </span>
          );
        })}
    </Card>
  );
};

export default PokemonCard;
