import {
  Autocomplete,
  createFilterOptions,
  Paper,
  TextField,
} from "@mui/material";
import { Pokemon } from "pokeapi-js-wrapper";
import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "../../api";
import PageContainer from "../../layout/PageContainer";
import inputClasses from "./LinkBattle.module.scss";

const LinkBattle: React.FC = () => {
  const [input, setInput] = useState("");
  const [pokemonNames, setPokemonNames] = useState<string[]>([]);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const enterPokemon = useCallback(
    async (pokemonName: string) => {
      if (isSubmittingAnswer || !pokemonNames.includes(pokemonName)) {
        return;
      }
      if (pokemons.some((pokemon) => pokemon.name === pokemonName)) {
        setInput("");
        return;
      }
      setIsSubmittingAnswer(true);
      const previousPokemon = pokemons[pokemons.length - 1];
      try {
        const pokemon = await api.data.validatePokemon(
          pokemonName,
          previousPokemon.name
        );
        if (pokemon) {
          setPokemons([...pokemons, pokemon]);
        }
      } catch (error) {
        console.error(error);
      }
      setIsSubmittingAnswer(false);
      setInput("");
    },
    [pokemons, pokemonNames, isSubmittingAnswer]
  );

  useEffect(() => {
    if (!isSubmittingAnswer) {
      inputRef.current?.focus();
    }
  }, [isSubmittingAnswer]);

  useEffect(() => {
    (async () => {
      const pokemonNames = await api.data.getPokemonNames();
      setPokemonNames(pokemonNames);
      const starterPokemon = await api.data.getStarterPokemon();
      setPokemons([starterPokemon]);
    })();
  }, []);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      enterPokemon(input);
    }
  };

  return (
    <PageContainer>
      <Autocomplete<string>
        autoFocus
        inputValue={input}
        renderInput={(props) => (
          <TextField
            {...props}
            onKeyDown={onKeyDown}
            onChange={(e) => setInput(e.target.value)}
            inputRef={inputRef}
          />
        )}
        options={pokemonNames}
        autoComplete
        fullWidth
        noOptionsText={null}
        popupIcon={null}
        filterOptions={createFilterOptions({ limit: 5, matchFrom: "start" })}
        PaperComponent={(props) => (
          <Paper
            {...props}
            elevation={3}
            className={inputClasses["Autocomplete__Paper"]}
          />
        )}
        componentsProps={{
          popper: {
            open: input.length > 0,
          },
        }}
        disabled={isSubmittingAnswer}
        onChange={(_, value, r) => {
          if (!value) {
            return;
          }
          setInput(value);
          r === "selectOption" && enterPokemon(value);
        }}
      />
      <div style={{ display: "flex", flexDirection: "column-reverse" }}>
        {pokemons.map((pokemon) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            key={pokemon.id}
          >
            <img src={pokemon.sprites.front_default ?? ""} alt={pokemon.name} />
            <span>{pokemon.name}</span>
            {pokemon.abilities.map(({ ability }) => (
              <span>{ability.name}</span>
            ))}
          </div>
        ))}
      </div>
    </PageContainer>
  );
};

export default LinkBattle;
