import {
  Autocomplete,
  createFilterOptions,
  Paper,
  TextField,
} from "@mui/material";
import { Pokedex, Pokemon } from "pokeapi-js-wrapper";
import React, { useCallback, useEffect, useRef, useState } from "react";
import PageContainer from "../../layout/PageContainer";
import inputClasses from "./LinkBattle.module.scss";

const pokedex = new Pokedex();

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
      try {
        const pokemon = await pokedex.getPokemonByName(pokemonName);
        if (
          pokemons[pokemons.length - 1].abilities.some(({ ability }) =>
            pokemon.abilities.some((a) => a.ability.name === ability.name)
          )
        ) {
          setPokemons([...pokemons, pokemon]);
        }
      } finally {
        setIsSubmittingAnswer(false);
        setInput("");
      }
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
      const response = await pokedex.getPokemonsList({
        offset: 0,
        limit: 10000,
      });
      setPokemonNames(response.results.map((pokemon) => pokemon.name));
      // eslint-disable-next-line no-constant-condition -- This has to terminate... right?
      while (true) {
        const starterIndex = Math.floor(
          Math.random() * response.results.length
        );
        const starterPokemon = await pokedex.getPokemonByName(
          response.results[starterIndex].name
        );
        const uniqueAbilities = await Promise.all(
          starterPokemon.abilities.map(async ({ ability }) => {
            const abilityData = await pokedex.getAbilityByName(ability.name);
            return abilityData.pokemon.length == 1;
          })
        );
        if (uniqueAbilities.every((unique) => unique)) {
          continue;
        }
        setPokemons([starterPokemon]);
        break;
      }
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
        onChange={(e, value, r) => {
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
