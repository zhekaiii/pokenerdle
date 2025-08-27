import TypeChip from "@/components/recyclables/TypeChip";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import {
  formatPokemonHeight,
  getFormattedPokemonName,
} from "@/utils/formatters";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { CheckCircle, Share2, TrendingUp } from "lucide-react";
import posthog from "posthog-js";
import React from "react";
import {
  challengeNumber,
  DAILY_CHALLENGE_GUESS_LIMIT,
} from "../../../constants";
import { shareResults } from "../../../utils/share";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  guesses: DailyChallengeGuessResponse[];
  hasSolved: boolean;
  hasReachedLimit: boolean;
  correctAnswer?: {
    pokemonId: number;
    pokemon: {
      type1: string;
      type2: string | null;
      height: number | null;
      generationId: number;
      color: string;
    };
  };
  onShowStatsDialog?: () => void;
};

const CompletionDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  guesses,
  hasSolved,
  correctAnswer,
  onShowStatsDialog,
}) => {
  const { getPokemonIcon } = usePokemonIcons();
  const pokemonNames = usePokemonNames();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const pokemonName =
    correctAnswer?.pokemonId != undefined
      ? pokemonNames[correctAnswer.pokemonId]
      : undefined;

  const handleShare = () => {
    posthog.capture("daily_challenge_share_clicked", {
      has_solved: hasSolved,
      num_guesses: guesses.length,
    });
    shareResults(guesses);
  };

  const attempts = guesses.length;
  const isSuccess = hasSolved;

  const getTitle = () => {
    if (isSuccess) {
      return attempts === 1 ? "First Try! 🎉" : `Well Done! 🎉`;
    }
    return "Game Over! 😔";
  };

  const getSubtitle = () => {
    if (isSuccess) {
      return attempts === 1
        ? "Incredible! You got it on your first guess!"
        : `You found the mystery Pokémon in ${attempts}/${DAILY_CHALLENGE_GUESS_LIMIT} tries!`;
    }
    return `You've used all ${DAILY_CHALLENGE_GUESS_LIMIT} attempts. Better luck tomorrow!`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="tw:flex tw:items-center tw:gap-2">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="tw:space-y-4">
          {/* Status Message */}
          <div className="tw:text-center tw:text-muted-foreground">
            {getSubtitle()}
          </div>

          {/* Challenge Info */}
          <div className="tw:flex tw:items-center tw:justify-center tw:gap-2 tw:text-sm tw:text-muted-foreground">
            <span>Daily Challenge #{challengeNumber}</span>
            <span>•</span>
            <span>
              {attempts}/{DAILY_CHALLENGE_GUESS_LIMIT} attempts
            </span>
          </div>

          {/* Correct Answer (if failed) */}
          {correctAnswer && (
            <Card>
              <CardContent>
                <div className="tw:text-center tw:mb-3">
                  <div className="tw:flex tw:items-center tw:justify-center tw:gap-3">
                    <img
                      src={getPokemonIcon(correctAnswer.pokemonId)}
                      alt="Correct Pokemon"
                      className="tw:w-12 tw:h-12"
                    />
                    <div className="tw:text-left">
                      <div className="tw:font-medium">
                        {pokemonName && getFormattedPokemonName(pokemonName)}
                      </div>
                      <div className="tw:text-sm tw:text-muted-foreground">
                        Gen {correctAnswer.pokemon.generationId} •{" "}
                        {formatPokemonHeight(correctAnswer.pokemon.height)} •{" "}
                        {correctAnswer.pokemon.color}
                      </div>
                    </div>
                  </div>
                  <div className="tw:flex tw:justify-center tw:gap-2 tw:mt-3">
                    <TypeChip type={correctAnswer.pokemon.type1} />
                    {correctAnswer.pokemon.type2 && (
                      <TypeChip type={correctAnswer.pokemon.type2} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Stats */}
          {isSuccess && (
            <div className="tw:flex tw:items-center tw:justify-center tw:gap-2 tw:text-sm">
              <CheckCircle className="tw:w-4 tw:h-4 tw:text-positive" />
              <span className="tw:text-muted-foreground">
                {attempts === 1
                  ? "Perfect score!"
                  : `Completed in ${attempts} ${
                      attempts === 1 ? "try" : "tries"
                    }`}
              </span>
            </div>
          )}

          {/* Share Button */}
          <div className="tw:flex tw:gap-2 tw:flex-col">
            <Button
              onClick={handleShare}
              className="tw:flex-1"
              variant={isSuccess ? "default" : "outline"}
            >
              <Share2 className="tw:w-4 tw:h-4" />
              Share Results
            </Button>

            {isAuthenticated && onShowStatsDialog && (
              <Button
                onClick={onShowStatsDialog}
                className="tw:flex-1"
                variant="outline"
              >
                <TrendingUp className="tw:w-4 tw:h-4" />
                Your Stats
              </Button>
            )}
            {!authLoading && !isAuthenticated && (
              <div className="tw:flex tw:flex-col tw:items-center tw:gap-2">
                <GoogleSignInButton className="tw:w-full" variant="outline" />
                <p className="tw:text-sm tw:text-muted-foreground">
                  Sign in to save your daily challenge results!
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionDialog;
