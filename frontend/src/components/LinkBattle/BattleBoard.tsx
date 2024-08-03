import { Pokemon } from "pokeapi-js-wrapper";
import React from "react";
import AbilityChip from "./AbilityChip";
import battleBoardClasses from "./BattleBoard.module.scss";
import PokemonCard from "./PokemonCard";

type Props = {
  pokemons: Pokemon[];
};

const getSharedAbilities = (pokemon1: Pokemon, pokemon2: Pokemon) => {
  return pokemon1.abilities.filter((ability1) =>
    pokemon2.abilities.some(
      (ability2) => ability1.ability.name === ability2.ability.name
    )
  );
};

const BattleBoard: React.FC<Props> = ({ pokemons }) => {
  return (
    <div className={battleBoardClasses.BattleBoard}>
      {pokemons.map((pokemon, pkmnIndex) => (
        <React.Fragment key={pokemon.id}>
          <PokemonCard pokemon={pokemon} />
          <div className={battleBoardClasses["BattleBoard__Separator"]} />
          {pkmnIndex < pokemons.length - 1 &&
            getSharedAbilities(pokemon, pokemons[pkmnIndex + 1]).map(
              ({ ability }) => <AbilityChip abilityName={ability.name} />
            )}
          <div className={battleBoardClasses["BattleBoard__Separator"]} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default BattleBoard;
