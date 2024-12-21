import { Button } from "@/components/ui/Button";
import { Autorenew, ExitToApp } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Autocomplete,
  Box,
  debounce,
  LinearProgress,
  Paper,
  Popper,
  Slide,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import Fuse from "fuse.js";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocalStorage } from "react-use";
import { useImmer } from "use-immer";
import api from "../../api";
import { BattleRoomSettings, PokemonGuess } from "../../api/battles/types";
import iconPlaceholder from "../../assets/question_mark.png";
import { useSocket } from "../../hooks/useSocket";
import { updateSharedLinks } from "../../utils/linkBattleUtils";
import BattleBoard from "./BattleBoard";
import battleScreenClasses from "./BattleScreen.module.scss";

type Props = {
  roomCode: string;
  settings: BattleRoomSettings;
  isGoingFirst: boolean;
  starterPokemon: PokemonGuess;
  goBackToPreparation: () => void;
  exitRoom: () => void;
};

const BattleScreen: React.FC<Props> = ({
  roomCode,
  settings,
  isGoingFirst,
  starterPokemon,
  goBackToPreparation,
  exitRoom,
}) => {
  const socket = useSocket();
  const [input, setInput] = useState("");
  const [pokemonNames, setPokemonNames] = useLocalStorage<
    PokemonNamesResponse[]
  >("pokemonNames", []);
  const [pokemonIcons, setPokemonIcons] = useLocalStorage<
    Record<number, string | null>
  >("pokemonIcons", {});
  const [pokemons, setPokemons] = useState<PokemonGuess[]>([starterPokemon]);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [canMove, setCanMove] = useState(isGoingFirst);
  const [isGameEnded, setIsGameEnded] = useState(false);

  const [timerEndsAt, setTimerEndsAt] = useState(
    Date.now() + settings.timer * 1000
  );
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const [previousGuess, setPreviousGuess] = useState<string | null>(null);
  const [disallowedPokemon, setDisallowedPokemon] = useState<number[]>([
    starterPokemon.id,
  ]);
  const [sharedLinks, setSharedLinks] = useImmer<Record<string, number>>({});
  const [evolutionLinkCount, setEvolutionLinkCount] = useState<
    Record<string, number>
  >({});

  const [rematch, setRematch] = useState(false);
  const [opponentRematch, setOpponentRematch] = useState(false);
  const [rematchTimer, setRematchTimer] = useState(0);

  const filteredPokemon = useMemo(
    () =>
      new Fuse(
        pokemonNames?.filter(
          (pokemon) =>
            !guesses.includes(pokemon.id) &&
            !disallowedPokemon.includes(pokemon.id)
        ) ?? [],
        { keys: ["name", { name: "speciesName", weight: 2 }] }
      ),
    [pokemonNames, disallowedPokemon, guesses]
  );

  const suggestions = useMemo(
    () => filteredPokemon.search(input, { limit: 10 }).map(({ item }) => item),
    [filteredPokemon, input]
  );

  const hasWon = useMemo(() => isGameEnded && !canMove, [canMove, isGameEnded]);

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
  }, [timerEndsAt, isGameEnded]);

  const enterPokemon = useCallback(
    async (pokemon: PokemonNamesResponse) => {
      if (isSubmittingAnswer) {
        setInput("");
        return;
      }
      setIsSubmittingAnswer(true);
      setGuesses((guesses) => [...guesses, pokemon.id]);
      api.battles.validatePokemon(socket, pokemon, roomCode);
    },
    [isSubmittingAnswer, roomCode, socket]
  );

  const onRematch = useCallback(() => {
    socket.emit("rematch");
    setRematch(true);
  }, [socket]);

  useEffect(() => {
    if (!opponentRematch) {
      return;
    }
    if (rematchTimer <= 0) {
      socket.disconnect();
      return;
    }
    setTimeout(() => {
      setRematchTimer(rematchTimer - 1);
    }, 1000);
  }, [opponentRematch, rematchTimer, socket]);

  const closePopover = useCallback(
    debounce(() => {
      setIsErrorOpen(false);
    }, 4000),
    []
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
    socket.on(
      "pushPokemon",
      (
        pokemon: PokemonGuess,
        socketId: string,
        sameSpecies: number[],
        isSameEvoline: boolean
      ) => {
        if (pokemons.some((p) => p.id === pokemon.id)) {
          return;
        }
        pokemon.guessedBy = socketId;
        if (isSameEvoline) {
          pokemon.isSameEvoline = true;
          setEvolutionLinkCount((draft) => {
            draft[socketId] = (draft[socketId] || 0) + 1;
            return draft;
          });
        }
        setSharedLinks((draft) => {
          updateSharedLinks(pokemons[pokemons.length - 1], pokemon, draft);
        });
        setPokemons((pokemons) => [...pokemons, pokemon]);
        setDisallowedPokemon((disallowedPokemon) => [
          ...disallowedPokemon,
          ...sameSpecies,
        ]);
        setGuesses([]);
        setIsSubmittingAnswer(false);
        setInput("");
        setIsErrorOpen(false);
      }
    );
    socket.on("wrongAnswer", (guess: string) => {
      setIsErrorOpen(true);
      setPreviousGuess(guess);
      setIsSubmittingAnswer(false);
      setInput("");
      closePopover();
    });
    socket.on("gameEnd", () => {
      setIsGameEnded(true);
      socket.on("rematch", (socketId: string, bothOk: boolean) => {
        if (socketId !== socket.id) {
          setOpponentRematch(true);
          setRematchTimer(15);
        }
        if (bothOk) {
          goBackToPreparation();
        }
      });
    });
    if (!pokemonNames?.length) api.data.getPokemonNames().then(setPokemonNames);
    if (!pokemonIcons || !pokemonIcons[1])
      api.data.getPokemonIcons().then(setPokemonIcons);
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
  }, [socket, goBackToPreparation, closePopover, pokemons]);

  const textField = useMemo(
    () => (
      <Autocomplete<PokemonNamesResponse>
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
        filterOptions={(options) => options}
        disabled={isSubmittingAnswer || !canMove}
        onChange={(_, pokemon, r) => {
          if (!pokemon) {
            return;
          }
          setInput(pokemon.name);
          if (r === "selectOption") enterPokemon(pokemon);
        }}
        slots={{
          paper: (props) => (
            <Paper
              {...props}
              elevation={3}
              className={battleScreenClasses["BattleScreen__AutocompletePaper"]}
            />
          ),
        }}
        slotProps={{
          popper: {
            open: input.length > 0,
          },
        }}
        getOptionKey={(option) => option.id}
        getOptionLabel={(option) => option.name}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Box key={key} {...optionProps} component="li">
              {
                <img
                  className={battleScreenClasses.BattleScreen__PokemonIcon}
                  src={pokemonIcons?.[option.id] ?? iconPlaceholder}
                />
              }
              {option.name}
            </Box>
          );
        }}
      />
    ),
    [canMove, enterPokemon, input, isSubmittingAnswer, suggestions]
  );

  return (
    <div className={battleScreenClasses["BattleScreen__Contents"]}>
      <Alert
        className="tw-mb-2 tw-justify-center tw-relative tw-overflow-hidden"
        icon={false}
        color={hasWon || canMove ? "success" : "error"}
      >
        <span>
          {isGameEnded
            ? `${hasWon ? "You" : "Your opponent"} won!`
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
      {isGameEnded && (
        <Stack
          direction="row"
          alignItems="self-start"
          spacing={2}
          marginBottom={1}
        >
          <Button variant="destructive" onClick={exitRoom}>
            <ExitToApp /> Exit
          </Button>
          <Stack spacing={1} textAlign="center" flexGrow={1}>
            <Button
              className="tw-w-full"
              onClick={onRematch}
              disabled={rematch}
            >
              <Autorenew /> Rematch {rematchTimer > 0 && `(${rematchTimer})`}
            </Button>
            {opponentRematch && (
              <Typography variant="caption">
                Opponent wants a rematch
              </Typography>
            )}
          </Stack>
        </Stack>
      )}
      <BattleBoard
        pokemons={pokemons}
        showAbility={settings.showAbility}
        isGameEnded={isGameEnded}
        sharedLinks={sharedLinks}
        evolutionLinkCount={evolutionLinkCount}
      />
    </div>
  );
};

export default BattleScreen;
