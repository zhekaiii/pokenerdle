import React, { useEffect, useState } from "react";

import { NoSsr } from "@/components/NoSsr";
import LoadingDialog from "@/components/recyclables/LoadingDialog";
import PokemonCombobox from "@/components/recyclables/PokemonCombobox";
import PokemonReferenceDialog from "@/components/recyclables/PokemonReferenceDialog";
import { TypeChecklist } from "@/components/recyclables/TypeChecklist/TypeChecklist";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { DailyChallengeGuessBox } from "@/pages/DailyChallenge/components/Gameplay/components/DailyChallengeGuessBox";
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
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
  const { t } = useTranslation("daily");
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
        {t("challengeNumber", { number: challengeNumber })}
      </h2>
      <div className="tw:text-center tw:text-muted-foreground tw:mb-2">
        {hasSolved
          ? t("gameplay.foundPokemon")
          : hasReachedLimit
            ? t("gameplay.betterLuckTomorrow")
            : t("gameplay.guessPrompt", {
                count:
                  DAILY_CHALLENGE_GUESS_LIMIT - (guesses?.guesses.length ?? 0),
              })}
      </div>

      <div className="tw:grid tw:grid-flow-row tw:gap-2">
        {Array.from({
          length: isGameFinished
            ? (guesses?.guesses.length ?? 0)
            : (guesses?.guesses.length ?? 0) + 1,
        }).map((_, i) => {
          const guess = guesses?.guesses[i];
          return (
            <DailyChallengeGuessBox key={i} guess={guess} guessNumber={i + 1}>
              <div className={clsx(styles.DailyChallengeInputContainer)}>
                <PokemonCombobox
                  className="tw:bg-background"
                  disabled={isLoading}
                  input={input}
                  setInput={setInput}
                  side="bottom"
                  onSelect={(pokemon) => {
                    posthog.capture("daily_challenge_guess", {
                      from: "pokemon_combobox",
                    });
                    onSelectPokemon(pokemon);
                  }}
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
            </DailyChallengeGuessBox>
          );
        })}
      </div>
      {!hasReachedLimit && !hasSolved ? (
        <>
          <hr className="tw:my-4" />
          <TypeChecklist guesses={guesses?.guesses || []} />
        </>
      ) : (
        <>
          <hr className="tw:my-4" />
          <CorrectAnswerCard
            correctAnswer={
              hasSolved
                ? guesses!.guesses[guesses!.guesses.length - 1]
                : correctAnswer
            }
          />
          <div className="tw:flex tw:flex-col tw:gap-2 tw:mt-auto">
            <div className="tw:flex tw:gap-2 tw:mt-4">
              <Button
                className="tw:flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateShareText(guesses?.guesses ?? [], t),
                  );
                  posthog.capture("daily_challenge_copy_clicked");
                  toast(t("share.success"), {
                    icon: <ClipboardCheck />,
                  });
                }}
              >
                <Clipboard /> {t("buttons.copy")}
              </Button>
              <NoSsr>
                {"share" in navigator && (
                  <Button
                    className="tw:flex-1"
                    onClick={() => {
                      posthog.capture("daily_challenge_share_clicked", {
                        has_solved: hasSolved,
                        num_guesses: guesses?.guesses.length ?? 0,
                      });
                      shareResults(guesses?.guesses ?? [], t);
                    }}
                  >
                    <Share2 /> {t("buttons.share")}
                  </Button>
                )}
              </NoSsr>
            </div>
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="tw:w-full"
                onClick={() => setShowStatsDialog(true)}
              >
                <TrendingUp />
                {t("gameplay.viewStats")}
              </Button>
            ) : (
              !authLoading && (
                <>
                  <GoogleSignInButton variant="outline" />
                  <p className="tw:text-sm tw:text-muted-foreground tw:text-center">
                    {t("gameplay.signInPrompt")}
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
        onGuess={(pokemon) => {
          posthog.capture("daily_challenge_guess", {
            from: "pokemon_reference",
          });
          onSelectPokemon(pokemon);
          setShowPokemonReference(false);
        }}
        disabled={
          new Set(guesses?.guesses.map(({ pokemonId }) => pokemonId) ?? [])
        }
      />
    </div>
  );
};

export default DailyChallengeGameplay;
