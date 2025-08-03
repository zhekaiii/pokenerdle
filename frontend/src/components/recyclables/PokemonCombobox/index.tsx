import api from "@/api";
import iconPlaceholder from "@/assets/question_mark.png";
import { isCmdOrCtrl } from "@/lib/utils";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import React, { useEffect } from "react";
import { BrowserView, isMacOs } from "react-device-detect";
import { useLocalStorage } from "react-use";
import { ComboBox } from "../../ui/ComboBox";
import classes from "./index.module.scss";

type Props = {
  input: string;
  setInput: (input: string) => void;
  suggestions: PokemonNamesResponse[];
  disabled?: boolean;
  onSelect: (option: PokemonNamesResponse) => void;
};

const PokemonCombobox: React.FC<Props> = ({
  input,
  setInput,
  suggestions,
  disabled,
  onSelect,
}) => {
  const [pokemonIcons, setPokemonIcons] = useLocalStorage<
    Record<number, string | null>
  >("pokemonIcons", {});
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
    if (!pokemonIcons || !pokemonIcons[1])
      api.data.getPokemonIcons().then(setPokemonIcons);
  }, []);

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
        value={input}
        setValue={setInput}
        options={suggestions}
        getOptionValue={(option) => option.id}
        getOptionLabel={(option) => option.name || option.speciesName}
        disabled={disabled}
        onKeyDown={onKeyDown}
        renderItemContent={(option, index) => (
          <div className="tw:flex tw:justify-between tw:items-center tw:w-full">
            <div className="tw:flex tw:items-center">
              <img
                className={classes["PokemonCombobox__PokemonIcon"]}
                src={pokemonIcons?.[option.id] ?? iconPlaceholder}
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
        }}
      />
    </form>
  );
};

export default PokemonCombobox;
