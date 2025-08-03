import api from "@/api";
import iconPlaceholder from "@/assets/question_mark.png";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import React, { useEffect } from "react";
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
        renderItemContent={(option) => (
          <>
            <img
              className={classes["PokemonCombobox__PokemonIcon"]}
              src={pokemonIcons?.[option.id] ?? iconPlaceholder}
            />
            {option.name || option.speciesName}
          </>
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
