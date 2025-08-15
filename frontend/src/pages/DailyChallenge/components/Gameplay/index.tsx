import React, { useState } from "react";

import LoadingDialog from "@/components/recyclables/LoadingDialog";
import PokemonCombobox from "@/components/recyclables/PokemonCombobox";
import PokemonReferenceDialog from "@/components/recyclables/PokemonReferenceDialog";
import { Button } from "@/components/ui/Button";
import CompletionDialog from "@/pages/DailyChallenge/components/Gameplay/components/CompletionDialog";
import { DailyChallengeGuessBoxMemo } from "@/pages/DailyChallenge/components/Gameplay/components/DailyChallengeGuessBox";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import clsx from "clsx";
import { BookOpen, Eye, Share2 } from "lucide-react";
import posthog from "posthog-js";
import { useEffect } from "react";
import { challengeNumber, DAILY_CHALLENGE_GUESS_LIMIT } from "../../constants";
import { useDailyChallengeData } from "../../hooks/useData";
import { shareResults } from "../../utils/share";
import styles from "./index.module.scss";

const DailyChallengeGameplay: React.FC = () => {
  const {
    onGuess,
    guesses,
    isLoading,
    hasSolved,
    hasReachedLimit,
    isGameFinished,
    correctAnswer,
    isLoadingAnswer,
    hasDialogBeenShownToday,
    markDialogAsShown,
  } = useDailyChallengeData();
  const [input, setInput] = useState("");
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showPokemonReference, setShowPokemonReference] = useState(false);

  const onSelectPokemon = (pokemon: PokemonNamesResponse) => {
    onGuess(pokemon).finally(() => setInput(""));
  };

  // Show completion dialog when game is finished and dialog hasn't been shown today
  useEffect(() => {
    if (isGameFinished && !hasDialogBeenShownToday && !showCompletionDialog) {
      setShowCompletionDialog(true);
    }
  }, [isGameFinished, hasDialogBeenShownToday, showCompletionDialog]);

  const handleDialogOpenChange = (open: boolean) => {
    setShowCompletionDialog(open);
    if (!open && !hasDialogBeenShownToday) {
      // Mark dialog as shown when it's closed for the first time
      markDialogAsShown();
    }
  };

  const handleReopenDialog = () => {
    setShowCompletionDialog(true);
  };

  return (
    <div className="tw:flex tw:flex-col tw:flex-auto tw:max-w-[400px] tw:w-full">
      <LoadingDialog open={isLoading || isLoadingAnswer} />
      <h2 className="tw:text-center tw:font-bold tw:text-lg">
        Daily Challenge #{challengeNumber}
      </h2>
      <div className="tw:text-center tw:text-muted-foreground tw:mb-2">
        {hasSolved ? (
          "You have found the mystery Pokémon!"
        ) : (
          <>
            {DAILY_CHALLENGE_GUESS_LIMIT - (guesses?.guesses.length ?? 0)}{" "}
            attempts left
          </>
        )}
      </div>

      <div className="tw:grid tw:grid-flow-row tw:gap-2">
        {Array.from({
          length: isGameFinished
            ? guesses?.guesses.length ?? 0
            : DAILY_CHALLENGE_GUESS_LIMIT,
        }).map((_, i) => {
          const guess = guesses?.guesses[i];
          return <DailyChallengeGuessBoxMemo key={i} guess={guess} />;
        })}
      </div>
      {!hasReachedLimit && !hasSolved ? (
        <>
          <div className="tw:mb-[50px]" />
          <div className={clsx(styles.DailyChallengeInputContainer)}>
            <PokemonCombobox
              className="tw:bg-background"
              disabled={isLoading}
              input={input}
              setInput={setInput}
              onSelect={onSelectPokemon}
              filter={
                guesses
                  ? (p) =>
                      !guesses.guesses
                        .map(({ pokemonId }) => pokemonId)
                        .includes(p.id)
                  : undefined
              }
            />
            <Button
              size="icon"
              className="tw:flex-shrink-0"
              onClick={() => {
                posthog.capture("daily_challenge_pokemon_reference_opened");
                setShowPokemonReference(true);
              }}
            >
              <BookOpen />
            </Button>
          </div>
        </>
      ) : (
        <div className="tw:flex tw:flex-col tw:gap-2 tw:mt-auto">
          <Button
            className="tw:w-full tw:mt-2"
            onClick={() => {
              posthog.capture("daily_challenge_share_clicked", {
                has_solved: hasSolved,
                num_guesses: guesses?.guesses.length ?? 0,
              });
              shareResults(guesses?.guesses ?? []);
            }}
          >
            <Share2 /> Share
          </Button>
          {hasDialogBeenShownToday && (
            <Button
              variant="outline"
              size="sm"
              className="tw:w-full"
              onClick={handleReopenDialog}
            >
              <Eye />
              View Results
            </Button>
          )}
        </div>
      )}

      <CompletionDialog
        open={showCompletionDialog}
        onOpenChange={handleDialogOpenChange}
        guesses={guesses?.guesses ?? []}
        hasSolved={hasSolved}
        hasReachedLimit={hasReachedLimit}
        correctAnswer={
          correctAnswer ??
          (hasSolved
            ? guesses!.guesses[guesses!.guesses.length - 1]
            : undefined)
        }
      />

      <PokemonReferenceDialog
        open={showPokemonReference}
        onOpenChange={setShowPokemonReference}
      />
    </div>
  );
};

export default DailyChallengeGameplay;
