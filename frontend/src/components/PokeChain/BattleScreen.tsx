import { Button } from "@/components/ui/Button";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import { useToast } from "@/hooks/useToast";
import { trackAbilityLinkUsed, trackPokemonGuessed } from "@/lib/events";
import {
  ForfeitInfo,
  PokemonNamesResponse,
  WrongAnswerReason,
} from "@pokenerdle/shared";
import { LogOut, RefreshCw } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useImmer } from "use-immer";
import api from "../../api";
import { PokemonGuess } from "../../api/battles/types";
import { useSocket } from "../../hooks/useSocket";
import {
  getSharedAbilities,
  MAX_LINKS,
  updateSharedLinks,
} from "../../utils/pokeChainUtils";
import PokemonCombobox from "../recyclables/PokemonCombobox";
import { Alert } from "../ui/Alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/AlertDialog";
import { Progress } from "../ui/Progress";
import BattleBoard from "./BattleBoard";
import battleScreenClasses from "./BattleScreen.module.scss";
import GameHeader from "./GameHeader";
import LinkChip from "./LinkChip";
import { usePokeChainContext } from "./context/PokeChainContext";

type Props = {
  isGoingFirst: boolean;
  starterPokemon: PokemonGuess;
  goBackToPreparation: () => void;
  exitRoom: () => void;
};

const BattleScreen: React.FC<Props> = ({
  isGoingFirst,
  starterPokemon,
  goBackToPreparation,
  exitRoom,
}) => {
  const socket = useSocket();
  const { roomCode, settings, isSinglePlayer, setStarterPokemon } =
    usePokeChainContext();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const pokemonNames = usePokemonNames();
  const [pokemons, setPokemons] = useState<PokemonGuess[]>([starterPokemon]);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPlayersTurn, setIsPlayersTurn] = useState(isGoingFirst);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [forfeitInfo, setForfeitInfo] = useState<ForfeitInfo | null>(null);
  const [playerPoints, setPlayerPoints] = useState(0);
  const [opponentPoints, setOpponentPoints] = useState(0);
  const [playerStreak, setPlayerStreak] = useState(0);
  const [opponentStreak, setOpponentStreak] = useState(0);

  const [timerEndsAt, setTimerEndsAt] = useState(
    Date.now() + settings.timer * 1000
  );
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [guesses, setGuesses] = useState<number[]>([]);

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

  const hasWon = useMemo(
    () =>
      isGameEnded &&
      (playerPoints > opponentPoints ||
        (forfeitInfo?.forfeit && forfeitInfo.forfeitedBy != socket.id)),
    [isGameEnded, playerPoints, opponentPoints, forfeitInfo, socket]
  );

  const isDraw = useMemo(
    () =>
      isGameEnded && !forfeitInfo?.forfeit && playerPoints === opponentPoints,
    [isGameEnded, playerPoints, opponentPoints]
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
        if (isPlayersTurn) {
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
      api.battles.validatePokemon(socket, pokemon, roomCode!);
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

  useEffect(() => {
    if (!isSubmittingAnswer) {
      inputRef.current?.focus();
    }
  }, [isSubmittingAnswer]);

  useEffect(() => {
    socket.on("canMove", (socketId: string, timerEndsAt: number) => {
      setIsPlayersTurn(socketId === socket.id);
      setTimerEndsAt(timerEndsAt);
      setIsSubmittingAnswer(false);
      setInput("");
    });
    socket.on(
      "pushPokemon",
      (
        pokemon: PokemonGuess,
        socketId: string,
        sameSpecies: number[],
        isSameEvoline: boolean,
        points: number
      ) => {
        if (pokemons.some((p) => p.id === pokemon.id)) {
          return;
        }
        if (socketId === socket.id) {
          setPlayerPoints(points);
          setPlayerStreak((playerStreak) => playerStreak + 1);

          trackPokemonGuessed({
            pokemon_id: pokemon.id,
            pokemon_name: pokemon.name,
            is_correct: true,
            streak_count: playerStreak + 1,
            is_evolution_link: isSameEvoline,
            chain_position: pokemons.length + 1,
            is_single_player: isSinglePlayer,
          });

          const previousPokemon = pokemons[pokemons.length - 1];
          const sharedAbilities = getSharedAbilities(previousPokemon, pokemon);
          sharedAbilities.forEach((ability) => {
            trackAbilityLinkUsed({
              ability_name: ability.name,
              ability_id: ability.id,
            });
          });
        } else {
          setOpponentPoints(points);
          setOpponentStreak((opponentStreak) => opponentStreak + 1);
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
      }
    );
    socket.on("wrongAnswer", ({ pokemonId, points, player, reason }) => {
      const isPlayersTurn = player === socket.id;
      const pronoun = isPlayersTurn ? "You" : "Your opponent";
      const pokemonName = pokemonNames?.find(
        (pokemon) => pokemon.id == pokemonId
      )?.name;
      toast({
        variant: "destructive",
        title: (
          <>
            {pronoun} guessed{" "}
            <span className="tw:capitalize">{pokemonName}</span>
          </>
        ),
        description: (
          <>
            {reason === WrongAnswerReason.AbilityLinkDepleted
              ? `${pronoun} cannot use the same ability as a link more than ${MAX_LINKS} times.`
              : reason === WrongAnswerReason.EvolutionLinkDepleted
              ? `${pronoun} cannot guess Pokémon in the same evolution chain more than ${MAX_LINKS} times.`
              : `${pokemonName} does not share an ability with the previous Pokémon.`}
          </>
        ),
      });
      if (isPlayersTurn) {
        setPlayerPoints(points);
        setPlayerStreak(0);

        trackPokemonGuessed({
          pokemon_id: pokemonId,
          pokemon_name: pokemonName || "",
          is_correct: false,
          reason,
          is_single_player: isSinglePlayer,
        });
      } else {
        setOpponentPoints(points);
        setOpponentStreak(0);
      }
      setIsSubmittingAnswer(false);
      setInput("");
    });
    socket.on("gameEnd", (data) => {
      setIsGameEnded(true);
      if (data.forfeitInfo) {
        setForfeitInfo(data.forfeitInfo);
      }
      if (data.points) {
        for (const [socketId, points] of Object.entries(data.points)) {
          if (socketId === socket.id) {
            setPlayerPoints(points);
          } else {
            setOpponentPoints(points);
          }
        }
      }
      socket.on("rematch", (socketId, ready, starterPokemon) => {
        setStarterPokemon(starterPokemon);
        if (socketId !== socket.id) {
          setOpponentRematch(true);
          setRematchTimer(15);
        }
        if (ready) {
          goBackToPreparation();
        }
      });
    });
    return () => {
      socket.off("pushPokemon");
      socket.off("wrongAnswer");
      socket.off("canMove");
      socket.off("gameEnd");
    };
  }, [socket, goBackToPreparation, pokemons]);

  const alertMessage = useMemo(() => {
    if (isSinglePlayer) {
      if (!isGameEnded) {
        return "Guess a Pokémon!";
      }
      if (forfeitInfo?.forfeit) {
        return "You ended the game!";
      }
      return "Game Over!";
    }
    if (!isGameEnded) {
      return isPlayersTurn ? "Your turn" : "Opponent's turn";
    }
    if (forfeitInfo?.forfeit) {
      return forfeitInfo.forfeitedBy === socket.id
        ? "You forfeited the match!"
        : "Your opponent forfeited!";
    }
    if (isDraw) {
      return "It's a draw!";
    }
    return `${hasWon ? "You" : "Your opponent"} won!`;
  }, [isGameEnded, forfeitInfo, socket.id, isDraw, hasWon, isPlayersTurn]);

  return (
    <div className={battleScreenClasses["BattleScreen__Contents"]}>
      <GameHeader
        playerPoints={playerPoints}
        opponentPoints={opponentPoints}
        playerStreak={playerStreak}
        opponentStreak={opponentStreak}
        chainLength={pokemons.length}
      />
      <div className="tw:mb-4"></div>
      <Alert
        className="tw:mb-4 tw:justify-center tw:relative tw:overflow-hidden"
        variant={
          hasWon || (!isGameEnded && isPlayersTurn) ? "positive" : "destructive"
        }
      >
        <span>{alertMessage}</span>
        {!isGameEnded && (
          <div className="tw:absolute tw:bottom-0 tw:start-0 tw:end-0">
            <Progress
              className="tw:h-1"
              color={isPlayersTurn ? "positive" : "destructive"}
              value={(secondsLeft / settings.timer) * 100}
            />
          </div>
        )}
      </Alert>
      {!isGameEnded && (
        <>
          <PokemonCombobox
            input={input}
            setInput={setInput}
            filter={(pokemon) =>
              !guesses.includes(pokemon.id) &&
              !disallowedPokemon.includes(pokemon.id)
            }
            onSelect={enterPokemon}
            disabled={isSubmittingAnswer || !isPlayersTurn}
            side="bottom"
          />
          <div className="tw:flex tw:justify-end tw:relative">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="tw:absolute tw:top-2 tw:end-0"
                >
                  {isSinglePlayer ? "Exit" : "Forfeit"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirm {isSinglePlayer ? "Exit" : "Forfeit"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to{" "}
                    {isSinglePlayer ? "exit" : "forfeit"} the{" "}
                    {isSinglePlayer ? "game" : "match"}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      socket.emit("forfeit");
                    }}
                  >
                    {isSinglePlayer ? "Exit" : "Forfeit"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
      {isGameEnded && (
        <div className="tw:flex tw:items-start tw:gap-4 tw:mb-4">
          <Button variant="destructive" onClick={exitRoom}>
            <LogOut /> Exit
          </Button>
          <div className="tw:flex tw:flex-col tw:items-center tw:gap-2 tw:grow">
            <Button
              className="tw:w-full"
              onClick={onRematch}
              disabled={rematch}
            >
              <RefreshCw /> {isSinglePlayer ? "Replay" : "Rematch"}{" "}
              {rematchTimer > 0 && `(${rematchTimer})`}
            </Button>
            {opponentRematch && <small>Opponent wants a rematch</small>}
          </div>
        </div>
      )}
      <BattleBoard
        pokemons={pokemons}
        showAbility={settings.showAbility}
        isGameEnded={isGameEnded}
        sharedLinks={sharedLinks}
        evolutionLinkCount={evolutionLinkCount}
      />
      {socket.id && evolutionLinkCount[socket.id.toString()] && (
        <LinkChip
          className="tw:fixed tw:start-4 tw:bottom-4 tw:opacity-90"
          variant="evolution"
          count={evolutionLinkCount[socket.id.toString()]}
          reactive
        />
      )}
    </div>
  );
};

export default BattleScreen;
