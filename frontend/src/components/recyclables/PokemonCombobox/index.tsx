import iconPlaceholder from "@/assets/question_mark.png";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { isCmdOrCtrl } from "@/lib/utils";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { PopoverContentProps } from "@radix-ui/react-popover";
import React, { useEffect, useMemo } from "react";
import { BrowserView, isMacOs } from "react-device-detect";
import { ComboBox } from "../../ui/ComboBox";
import classes from "./index.module.scss";

import { usePokemonNames } from "@/hooks/usePokemonNames";
import Fuse from "fuse.js";
type Props = {
  input: string;
  setInput: (input: string) => void;
  disabled?: boolean;
  onSelect: (option: PokemonNamesResponse) => void;
  side?: PopoverContentProps["side"];
  filter?: (pokemon: PokemonNamesResponse) => boolean;
};

const PokemonCombobox: React.FC<Props> = ({
  input,
  setInput,
  disabled,
  onSelect,
  side,
  filter,
}) => {
  const { pokemonIcons } = usePokemonIcons();
  const pokemonNames = usePokemonNames();
  const filteredPokemon = useMemo(
    () =>
      new Fuse(
        pokemonNames
          ? filter
            ? pokemonNames.filter(filter)
            : pokemonNames
          : [],
        {
          keys: ["name", { name: "speciesName", weight: 2 }],
        }
      ),
    [pokemonNames, filter]
  );
  const suggestions = useMemo(
    () => filteredPokemon.search(input, { limit: 10 }).map(({ item }) => item),
    [filteredPokemon, input]
  );

  const inputRef = React.useRef<HTMLInputElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isCmdOrCtrl(e)) return;
    if (e.key >= "0" && e.key <= "9") {
      const index = parseInt(e.key) == 0 ? 9 : parseInt(e.key) - 1;
      if (index >= suggestions.length) return;
      e.preventDefault();
      onSelect(suggestions[index]);
    }
  };

  useEffect(() => {
    if (disabled) return;
    inputRef.current?.focus();
  }, [disabled]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <ComboBox
        loop
        value={input}
        setValue={setInput}
        options={suggestions}
        getOptionValue={(option) => option.id}
        getOptionLabel={(option) => option.name || option.speciesName}
        disabled={disabled}
        onKeyDown={onKeyDown}
        popoverSide={side}
        renderItemContent={(option, index) => (
          <div className="tw:flex tw:justify-between tw:items-center tw:w-full">
            <div className="tw:flex tw:items-center">
              <img
                className={classes["PokemonCombobox__PokemonIcon"]}
                src={
                  pokemonIcons?.[option.id] ??
                  `https://raw.githubusercontent.com/pokedextracker/pokesprite/refs/heads/master/images/${option.id}.png`
                }
                onError={(e) => {
                  (e.target as HTMLImageElement).src = iconPlaceholder;
                }}
              />
              {option.name || option.speciesName}
            </div>
            <BrowserView>
              <span className="tw:text-muted-foreground">
                {index < 10 &&
                  (isMacOs ? "⌘" : "Ctrl") + "+" + ((index + 1) % 10)}
              </span>
            </BrowserView>
          </div>
        )}
        onSelect={onSelect}
        popoverContentProps={{
          className: "tw:opacity-80",
        }}
        inputProps={{
          ref: inputRef,
          placeholder: "Enter a Pokemon",
        }}
      />
    </form>
  );
};

export default PokemonCombobox;
