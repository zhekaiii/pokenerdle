import {
  Autocomplete,
  createFilterOptions,
  Paper,
  TextField,
} from "@mui/material";
import { Pokemon } from "pokeapi-js-wrapper";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import api from "../../api";
import battleScreenClasses from "./BattleScreen.module.scss";

type Props = {
  socket: Socket;
  roomCode: string;
};

const BattleScreen: React.FC<Props> = ({ socket, roomCode }) => {
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
      api.battles.validatePokemon(socket, pokemonName, roomCode);
    },
    [isSubmittingAnswer, pokemonNames, pokemons, socket, roomCode]
  );

  useEffect(() => {
    if (!isSubmittingAnswer) {
      inputRef.current?.focus();
    }
  }, [isSubmittingAnswer]);

  useEffect(() => {
    socket.on("pushPokemon", (pokemon: Pokemon) => {
      setPokemons((pokemons) => [...pokemons, pokemon]);
      setIsSubmittingAnswer(false);
      setInput("");
    });
    (async () => {
      const pokemonNames = await api.data.getPokemonNames();
      setPokemonNames(pokemonNames);
    })();
    return () => {
      socket.off("pushPokemon");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run once
  }, []);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      enterPokemon(input);
    }
  };

  return (
    <div className={battleScreenClasses["BattleScreen__Contents"]}>
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
            className={battleScreenClasses["BattleScreen__AutocompletePaper"]}
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
    </div>
  );
};

export default BattleScreen;
