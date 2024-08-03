import {
  Autocomplete,
  createFilterOptions,
  Paper,
  TextField,
} from "@mui/material";
import { Pokemon } from "pokeapi-js-wrapper";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Socket } from "socket.io-client";
import api from "../../api";
import battleScreenClasses from "./BattleScreen.module.scss";
import PokemonCard from "./PokemonCard";

type Props = {
  socket: Socket;
  roomCode: string;
};

const BattleScreen: React.FC<Props> = ({ socket, roomCode }) => {
  const [input, setInput] = useState("");
  const [pokemonNames, setPokemonNames] = useState<string[]>([]);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const suggestions = useMemo(
    () =>
      pokemonNames.filter(
        (name) => !pokemons.some((pokemon) => pokemon.name == name)
      ),
    [pokemonNames, pokemons]
  );
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const enterPokemon = useCallback(
    async (pokemonName: string) => {
      if (isSubmittingAnswer || !suggestions.includes(pokemonName)) {
        setInput("");
        return;
      }
      setIsSubmittingAnswer(true);
      api.battles.validatePokemon(socket, pokemonName, roomCode);
    },
    [isSubmittingAnswer, roomCode, socket, suggestions]
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
    socket.on("wrongAnswer", () => {
      setIsSubmittingAnswer(false);
      setInput("");
    });
    (async () => {
      const pokemonNames = await api.data.getPokemonNames();
      setPokemonNames(pokemonNames);
    })();
    return () => {
      socket.off("pushPokemon");
      socket.off("wrongAnswer");
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
        options={suggestions}
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
        className="tw-mb-4"
      />
      <div className={battleScreenClasses["BattleScreen_PokemonsContainer"]}>
        {pokemons.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
    </div>
  );
};

export default BattleScreen;
