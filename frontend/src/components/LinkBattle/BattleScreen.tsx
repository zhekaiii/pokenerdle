import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Autocomplete,
  createFilterOptions,
  debounce,
  LinearProgress,
  Paper,
  Popper,
  Slide,
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
import { BattleRoomSettings } from "../../api/battles/types";
import BattleBoard from "./BattleBoard";
import battleScreenClasses from "./BattleScreen.module.scss";

type Props = {
  socket: Socket;
  roomCode: string;
  settings: BattleRoomSettings;
  isGoingFirst: boolean;
  starterPokemon: Pokemon;
};

const BattleScreen: React.FC<Props> = ({
  socket,
  roomCode,
  settings,
  isGoingFirst,
  starterPokemon,
}) => {
  const [input, setInput] = useState("");
  const [pokemonNames, setPokemonNames] = useState<string[]>([]);
  const [pokemons, setPokemons] = useState<Pokemon[]>([starterPokemon]);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [canMove, setCanMove] = useState(isGoingFirst);
  const [timerEndsAt, setTimerEndsAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [previousGuess, setPreviousGuess] = useState<string | null>(null);

  const suggestions = useMemo(
    () =>
      pokemonNames.filter(
        (name) =>
          !guesses.includes(name) &&
          !pokemons.some((pokemon) => pokemon.name == name)
      ),
    [pokemonNames, pokemons, guesses]
  );

  useEffect(() => {
    if (isGameEnded) {
      return;
    }
    const interval = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.floor((timerEndsAt - Date.now()) / 100) / 10
      );
      setSecondsLeft(secondsLeft);
      if (secondsLeft == 0) {
        clearInterval(interval);
        if (canMove) {
          setIsSubmittingAnswer(true);
        }
      }
    }, 100);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't have to include canMove as dependency
  }, [timerEndsAt, isGameEnded]);

  const enterPokemon = useCallback(
    async (pokemonName: string) => {
      if (isSubmittingAnswer || !suggestions.includes(pokemonName)) {
        setInput("");
        return;
      }
      setIsSubmittingAnswer(true);
      setGuesses((guesses) => [...guesses, pokemonName]);
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
    socket.on("canMove", (socketId: string, timerEndsAt: number) => {
      setCanMove(socketId === socket.id);
      setTimerEndsAt(timerEndsAt);
      setIsSubmittingAnswer(false);
      setInput("");
      setIsErrorOpen(false);
    });
    socket.on("pushPokemon", (pokemon: Pokemon) => {
      setPokemons((pokemons) => [...pokemons, pokemon]);
      setGuesses([]);
      setIsSubmittingAnswer(false);
      setInput("");
      setIsErrorOpen(false);
    });
    socket.on("wrongAnswer", (guess: string) => {
      setIsErrorOpen(true);
      setPreviousGuess(guess);
      setIsSubmittingAnswer(false);
      setInput("");
      closePopover();
    });
    socket.on("gameEnd", () => {
      setIsGameEnded(true);
    });
    (async () => {
      const pokemonNames = await api.data.getPokemonNames();
      setPokemonNames(pokemonNames);
    })();
    return () => {
      socket.off("pushPokemon");
      socket.off("wrongAnswer");
      socket.off("canMove");
      socket.off("gameEnd");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run once
  }, []);

  const textField = useMemo(
    () => (
      <Autocomplete<string>
        autoFocus
        inputValue={input}
        renderInput={(props) => (
          <TextField
            {...props}
            onChange={(e) => setInput(e.target.value)}
            inputRef={inputRef}
            placeholder="e.g. Pikachu"
            spellCheck={false}
            autoComplete="off"
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
        disabled={isSubmittingAnswer || !canMove}
        onChange={(_, value, r) => {
          if (!value) {
            return;
          }
          setInput(value);
          r === "selectOption" && enterPokemon(value);
        }}
      />
    ),
    [canMove, enterPokemon, input, isSubmittingAnswer, suggestions]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps -- there are no unknown dependencies
  const closePopover = useCallback(
    debounce(() => {
      setIsErrorOpen(false);
    }, 4000),
    []
  );

  return (
    <div className={battleScreenClasses["BattleScreen__Contents"]}>
      <Alert
        className="tw-mb-2 tw-justify-center tw-relative tw-overflow-hidden"
        icon={false}
        color={canMove != isGameEnded ? "success" : "error"}
      >
        <span>
          {isGameEnded
            ? `${
                canMove ? "You" : "Your opponent"
              } took too long to enter a Pokémon!`
            : canMove
            ? "Your turn"
            : "Opponent's turn"}
        </span>
        {!isGameEnded && (
          <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0">
            <LinearProgress
              color={canMove ? "success" : "error"}
              value={(secondsLeft / settings.timer) * 100}
              variant="determinate"
            />
          </div>
        )}
      </Alert>
      {!isGameEnded && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enterPokemon(input);
          }}
        >
          {textField}
          <Popper
            open={isErrorOpen}
            anchorEl={inputRef.current}
            placement="bottom"
            modifiers={[{ name: "offset", options: { offset: [0, 16] } }]}
            transition
          >
            {({ TransitionProps }) => (
              <Slide {...TransitionProps} timeout={350}>
                <Alert
                  className={battleScreenClasses.BattleScreen__WrongAnswerAlert}
                  icon={<CloseIcon />}
                  severity="error"
                  variant="outlined"
                >
                  {canMove ? "You" : "Your opponent"} guessed{" "}
                  <span className="tw-capitalize">{previousGuess}</span>
                </Alert>
              </Slide>
            )}
          </Popper>
        </form>
      )}
      <BattleBoard
        pokemons={pokemons}
        showAbility={settings.showAbility}
        isGameEnded={isGameEnded}
      />
    </div>
  );
};

export default BattleScreen;
