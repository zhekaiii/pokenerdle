// TODO: Refactor this messy code

import TypeChip from "@/components/recyclables/TypeChip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
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
  guess: DailyChallengeGuessResponse & { pokemonId: number };
  children: React.ReactNode;
  guessOrder: number;
};

const PokeInfoPopover: React.FC<Props> = ({
  guess: { pokemon, ...guess },
  children,
  guessOrder,
}) => {
  const pokemonNames = usePokemonNames();
  const { getPokemonIcon } = usePokemonIcons();
  const pokemonName = useMemo(() => {
    const pokemonNameResponse = pokemonNames?.find(
      (pokemon) => pokemon.id === guess.pokemonId
    );
    if (!pokemonNameResponse) {
      return "";
    }
    return pokemonNameResponse.name || pokemonNameResponse.speciesName;
  }, [guess, pokemonNames]);
  const pokemonHeight = ((pokemon.height ?? 0) / 10).toFixed(1);
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent>
        <section className="tw:flex tw:items-center">
          <img src={getPokemonIcon(guess.pokemonId)} className="tw:me-1" />
          <div>
            <div className="tw:font-bold">{pokemonName}</div>
            <div className="tw:text-muted-foreground tw:text-sm">
              Guess #{guessOrder}
            </div>
          </div>
        </section>
        <section className="tw:mt-2">
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
        </section>
        <hr className="tw:border tw:my-2" />
        <section>
          <ul className="tw:list-disc tw:ps-6">
            {guess.correct ? (
              <li>You are correct!</li>
            ) : (
              <>
                <li>
                  {guess.type1Correctness === "=" ? (
                    <>
                      Target is also a{" "}
                      <TypeChip
                        className="tw:text-foreground tw:align-middle"
                        type={pokemon.type1}
                      />{" "}
                      type!
                    </>
                  ) : (
                    <>
                      <TypeChip
                        className="tw:text-foreground tw:align-middle"
                        type={pokemon.type1}
                      />{" "}
                      type moves deal {guess.type1Correctness}x damage against
                      the target.
                    </>
                  )}
                </li>
                <li>
                  {guess.type2Correctness === "=" ? (
                    <>
                      Target is also a{" "}
                      {pokemon.type2 ? (
                        <TypeChip
                          className="tw:text-foreground tw:align-middle"
                          type={pokemon.type2}
                        />
                      ) : (
                        "mono"
                      )}
                      type!
                    </>
                  ) : pokemon.type2 ? (
                    <>
                      <TypeChip
                        className="tw:text-foreground tw:align-middle"
                        type={pokemon.type2}
                      />{" "}
                      type moves deal {guess.type2Correctness}x damage against
                      the target.
                    </>
                  ) : (
                    "Target is not a monotype"
                  )}
                </li>
                <li>
                  {guess.genCorrectness === "=" ? (
                    <>Target is from the same generation!</>
                  ) : (
                    <>
                      Target is from{" "}
                      {guess.genCorrectness === "<" ? "an earlier" : "a later"}{" "}
                      generation.
                    </>
                  )}
                </li>
                <li>
                  {guess.colorCorrectness ? (
                    <>Target is also {pokemon.color.toLowerCase()} in color!</>
                  ) : (
                    <>Target is not {pokemon.color.toLowerCase()} in color.</>
                  )}
                </li>
                <li>
                  {guess.heightCorrectness === "=" ? (
                    <>Target is also {pokemonHeight} m tall!</>
                  ) : (
                    <>
                      Target is{" "}
                      {guess.heightCorrectness === "<" ? "shorter" : "taller"}{" "}
                      than {pokemonHeight} m.
                    </>
                  )}
                </li>
              </>
            )}
          </ul>
        </section>
      </PopoverContent>
    </Popover>
  );
};

export default PokeInfoPopover;
