import { Pokemon } from "pokeapi-js-wrapper";
import React from "react";
import AbilityChip from "./AbilityChip";
import battleBoardClasses from "./BattleBoard.module.scss";
import PokemonCard from "./PokemonCard";

type Props = {
  pokemons: Pokemon[];
  showAbility: boolean;
  isGameEnded: boolean;
};

const getSharedAbilities = (pokemon1: Pokemon, pokemon2: Pokemon) => {
  return pokemon1.abilities.filter((ability1) =>
    pokemon2.abilities.some(
      (ability2) => ability1.ability.name === ability2.ability.name
    )
  );
};

const BattleBoard: React.FC<Props> = ({
  pokemons,
  showAbility,
  isGameEnded,
}) => {
  return (
    <div className={battleBoardClasses.BattleBoard}>
      {pokemons.map((pokemon, pkmnIndex) => (
        <React.Fragment key={pokemon.id}>
          <PokemonCard pokemon={pokemon} showAbility={showAbility} />
          {(!isGameEnded || pkmnIndex < pokemons.length - 1) && (
            <div className={battleBoardClasses["BattleBoard__Separator"]} />
          )}
          {pkmnIndex < pokemons.length - 1 &&
            getSharedAbilities(pokemon, pokemons[pkmnIndex + 1]).map(
              ({ ability }) => (
                <AbilityChip key={pokemon.id} abilityName={ability.name} />
              )
            )}
          {(!isGameEnded || pkmnIndex < pokemons.length - 1) && (
            <div className={battleBoardClasses["BattleBoard__Separator"]} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BattleBoard;
