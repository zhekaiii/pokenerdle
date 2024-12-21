import React from "react";
import { PokemonGuess } from "../../api/battles/types";
import { getSharedAbilities } from "../../utils/linkBattleUtils";
import AbilityChip from "./AbilityChip";
import battleBoardClasses from "./BattleBoard.module.scss";
import PokemonCard from "./PokemonCard";

type Props = {
  pokemons: PokemonGuess[];
  showAbility: boolean;
  isGameEnded: boolean;
  sharedLinks: Record<string, number>;
  evolutionLinkCount: Record<string, number>;
};

const BattleBoard: React.FC<Props> = ({
  pokemons,
  showAbility,
  isGameEnded,
  sharedLinks,
  evolutionLinkCount,
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
            pokemons[pkmnIndex + 1].isSameEvoline &&
            pokemons[pkmnIndex + 1].guessedBy && (
              <AbilityChip
                abilityName="Same evolution line"
                count={evolutionLinkCount[pokemons[pkmnIndex + 1].guessedBy!]}
              />
            )}
          {pkmnIndex < pokemons.length - 1 &&
            getSharedAbilities(pokemon, pokemons[pkmnIndex + 1]).map(
              (ability) => (
                <AbilityChip
                  key={ability.name}
                  abilityName={ability.name}
                  count={sharedLinks[ability.name]}
                />
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
