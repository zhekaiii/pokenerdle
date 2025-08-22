import React, { useEffect, useState } from "react";

import LoadingDialog from "@/components/recyclables/LoadingDialog";
import PokemonCombobox from "@/components/recyclables/PokemonCombobox";
import PokemonReferenceDialog from "@/components/recyclables/PokemonReferenceDialog";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { DailyChallengeGuessBoxMemo } from "@/pages/DailyChallenge/components/Gameplay/components/DailyChallengeGuessBox";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import clsx from "clsx";
import {
  BookOpen,
  Clipboard,
  ClipboardCheck,
  Share2,
  TrendingUp,
} from "lucide-react";
import posthog from "posthog-js";
import { challengeNumber, DAILY_CHALLENGE_GUESS_LIMIT } from "../../constants";
import { useDailyChallengeData } from "../../hooks/useData";
import { generateShareText, shareResults } from "../../utils/share";
import CorrectAnswerCard from "./components/CorrectAnswerCard";
import StatsDialog from "./components/StatsDialog";
import styles from "./index.module.scss";

const DailyChallengeGameplay: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    onGuess,
    guesses,
    isLoading,
    hasSolved,
    hasReachedLimit,
    isGameFinished,
    correctAnswer,
    isLoadingAnswer,
  } = useDailyChallengeData();
  const [input, setInput] = useState("");
  const [showPokemonReference, setShowPokemonReference] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const { toast } = useToast();
  const onSelectPokemon = (pokemon: PokemonNamesResponse) => {
    onGuess(pokemon).finally(() => setInput(""));
  };

  useEffect(() => {
    if (!isGameFinished) {
      return;
    }
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 500);
  }, [isGameFinished]);

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
            attempts left to guess the mystery Pokémon!
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
        <>
          <hr className="tw:my-4" />
          <CorrectAnswerCard
            correctAnswer={
              correctAnswer! ??
              (hasSolved
                ? guesses!.guesses[guesses!.guesses.length - 1]
                : undefined)
            }
          />
          <div className="tw:flex tw:flex-col tw:gap-2 tw:mt-auto">
            <div className="tw:flex tw:gap-2 tw:mt-4">
              <Button
                className="tw:flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateShareText(guesses?.guesses ?? [])
                  );
                  posthog.capture("daily_challenge_copy_clicked");
                  toast({
                    description: (
                      <div className="tw:flex tw:flex-nowrap">
                        <ClipboardCheck className="tw:me-2" />
                        Results copied to clipboard!
                      </div>
                    ),
                  });
                }}
              >
                <Clipboard /> Copy
              </Button>
              <Button
                className="tw:flex-1"
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
            </div>
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="tw:w-full"
                onClick={() => setShowStatsDialog(true)}
              >
                <TrendingUp />
                View Stats
              </Button>
            ) : (
              !authLoading && (
                <>
                  <GoogleSignInButton variant="outline" />
                  <p className="tw:text-sm tw:text-muted-foreground tw:text-center">
                    Sign in to save your daily challenge results!
                  </p>
                </>
              )
            )}
          </div>
        </>
      )}

      <StatsDialog open={showStatsDialog} onOpenChange={setShowStatsDialog} />

      <PokemonReferenceDialog
        open={showPokemonReference}
        onOpenChange={setShowPokemonReference}
      />
    </div>
  );
};

export default DailyChallengeGameplay;
