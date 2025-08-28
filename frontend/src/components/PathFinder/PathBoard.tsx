import { PokemonWithAbilities } from "@pokenerdle/shared";
import React from "react";
import { getSharedAbilities } from "../../utils/pokeChainUtils";
import battleBoardClasses from "../PokeChain/BattleBoard.module.scss";
import LinkChip from "../PokeChain/LinkChip";
import PokemonCard from "../recyclables/PokemonCard";

interface Props {
  startPokemon: PokemonWithAbilities;
  endPokemon: PokemonWithAbilities;
  pathPokemon: PokemonWithAbilities[];
  onRemove: (index: number) => void;
}

const PathBoard: React.FC<Props> = ({
  startPokemon,
  endPokemon,
  pathPokemon,
  onRemove,
}) => {
  // Build the complete path: start -> path pokemon -> end
  const completePath = [startPokemon, ...pathPokemon, endPokemon];
  const isPathComplete =
    pathPokemon.length > 0 &&
    getSharedAbilities(pathPokemon[pathPokemon.length - 1], endPokemon).length >
      0;

  return (
    <div className={battleBoardClasses.BattleBoard}>
      {completePath.map((pokemon, index) => (
        <React.Fragment key={pokemon.id}>
          <PokemonCard
            pokemon={pokemon}
            showAbility
            removable={
              !isPathComplete && ![0, completePath.length - 1].includes(index)
            }
            onRemove={() => onRemove(index)}
          />

          {/* Show separator and ability links between consecutive Pokemon */}
          {index < completePath.length - 1 && (
            <>
              <div className={battleBoardClasses["BattleBoard__Separator"]} />

              {/* Show shared abilities between consecutive Pokemon */}
              {getSharedAbilities(pokemon, completePath[index + 1]).map(
                (ability) => (
                  <LinkChip
                    key={ability.name}
                    variant="ability"
                    abilityName={ability.name}
                    count={0} // Don't show usage count in path finder
                  />
                )
              )}

              {!isPathComplete && index === completePath.length - 2 && (
                <div className="tw:text-xs tw:bg-primary tw:text-primary-foreground tw:px-2 tw:py-1 tw:rounded tw:self-center">
                  ↓ Connect to target ↓
                </div>
              )}

              <div className={battleBoardClasses["BattleBoard__Separator"]} />
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default PathBoard;
