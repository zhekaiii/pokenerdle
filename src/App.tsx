import {
  Autocomplete,
  createFilterOptions,
  createTheme,
  Paper,
  TextField,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { Pokedex, Pokemon } from "pokeapi-js-wrapper";
import { useCallback, useEffect, useState } from "react";
import "./App.scss";
import inputClasses from "./Input.module.scss";
import PageContainer from "./layout/PageContainer";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const pokedex = new Pokedex();

function App() {
  const darkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [input, setInput] = useState("");
  const [pokemonNames, setPokemonNames] = useState<string[]>([]);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  const enterPokemon = useCallback(
    async (pokemonName: string) => {
      if (!pokemonNames.includes(pokemonName) && pokemons.length > 0) {
        return;
      }
      if (pokemons.some((pokemon) => pokemon.name === pokemonName)) {
        setInput("");
        return;
      }
      const pokemon = await pokedex.getPokemonByName(pokemonName);
      if (pokemons.length == 0) {
        setPokemons([pokemon]);
        return;
      }
      if (
        pokemons[pokemons.length - 1].abilities.some(({ ability }) =>
          pokemon.abilities.some((a) => a.ability.name === ability.name)
        )
      ) {
        setPokemons([...pokemons, pokemon]);
      }
      setInput("");
    },
    [pokemons, pokemonNames]
  );

  useEffect(() => {
    (async () => {
      const response = await pokedex.getPokemonsList({
        offset: 0,
        limit: 10000,
      });
      setPokemonNames(response.results.map((pokemon) => pokemon.name));
      enterPokemon(response.results[0].name);
    })();
    (async () => {})();
  }, []);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      enterPokemon(input);
    }
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <PageContainer>
        <Autocomplete<string>
          inputValue={input}
          renderInput={(props) => (
            <TextField
              {...props}
              onKeyDown={onKeyDown}
              onChange={(e) => setInput(e.target.value)}
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
              <img
                src={pokemon.sprites.front_default ?? ""}
                alt={pokemon.name}
              />
              <span>{pokemon.name}</span>
              {pokemon.abilities.map(({ ability }) => (
                <span>{ability.name}</span>
              ))}
            </div>
          ))}
        </div>
      </PageContainer>
    </ThemeProvider>
  );
}

export default App;
