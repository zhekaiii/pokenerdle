import TypeChip from "@/components/recyclables/TypeChip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import { getFormattedPokemonName } from "@/utils/formatters";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import {} from "@radix-ui/react-popover";
import clsx from "clsx";
import React, { useMemo } from "react";

const COLOR_MAP: Record<string, string> = {
  Black: "tw:bg-black",
  Blue: "tw:bg-blue-400",
  Brown: "tw:bg-amber-900",
  Gray: "tw:bg-gray-400",
  Green: "tw:bg-green-600",
  Pink: "tw:bg-pink-400",
  Purple: "tw:bg-purple-600",
  Red: "tw:bg-red-500",
  White: "tw:bg-white",
  Yellow: "tw:bg-yellow-400",
};

type Props = {
  pokemon: DailyChallengeGuessResponse["pokemon"];
  pokemonId: number;
  children: React.ReactNode;
  guessOrder: number;
};

const PokeInfoPopover: React.FC<Props> = ({
  pokemon,
  pokemonId,
  children,
  guessOrder,
}) => {
  const pokemonNames = usePokemonNames();
  const { getPokemonIcon } = usePokemonIcons();
  const pokemonName = useMemo(() => {
    const pokemonNameResponse = pokemonNames?.find(
      (pokemon) => pokemon.id === pokemonId
    );
    if (!pokemonNameResponse) {
      return "";
    }
    return getFormattedPokemonName(pokemonNameResponse);
  }, [pokemon, pokemonId, pokemonNames]);
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent>
        <div className="tw:flex tw:items-center">
          <img src={getPokemonIcon(pokemonId)} className="tw:me-1" />
          <div>
            <div className="tw:font-bold">
              #{pokemonId} {pokemonName}
            </div>
            <div className="tw:text-muted-foreground tw:text-sm">
              Guess #{guessOrder}
            </div>
          </div>
        </div>
        <div className="tw:mt-2">
          <div className="tw:flex tw:justify-between">
            <div>Types:</div>
            <div className="tw:flex tw:gap-1">
              <TypeChip type={pokemon.type1} />
              {pokemon.type2 && <TypeChip type={pokemon.type2} />}
            </div>
          </div>
          <div className="tw:flex tw:justify-between">
            <div>Color:</div>
            <div>
              <div
                className={clsx(
                  "tw:h-3 tw:w-3 tw:inline-block tw:me-1 tw:border",
                  COLOR_MAP[pokemon.color]
                )}
              />
              {pokemon.color}
            </div>
          </div>
          <div className="tw:flex tw:justify-between">
            <div>Height:</div>
            <div>{((pokemon.height ?? 0) / 10).toFixed(1)} m</div>
          </div>
          <div className="tw:flex tw:justify-between">
            <div>Generation:</div>
            <div>{pokemon.generationId}</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PokeInfoPopover;
