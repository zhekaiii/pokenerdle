import api from "@/api";
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
import { useToast } from "@/hooks/useToast";
import { guessesAtom } from "@/pages/DailyChallenge/hooks/useData";
import {
  formatPokemonHeight,
  getFormattedPokemonName,
} from "@/utils/formatters";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { useSetAtom } from "jotai";
import { CheckCircle, CloudUpload, Share2 } from "lucide-react";
import posthog from "posthog-js";
import React, { useEffect, useState } from "react";
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
  date: string;
};

const CompletionDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  guesses,
  hasSolved,
  correctAnswer,
  date,
}) => {
  const { getPokemonIcon } = usePokemonIcons();
  const pokemonNames = usePokemonNames();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const setGuesses = useSetAtom(guessesAtom);
  const pokemonName = pokemonNames?.find(
    (pokemon) => pokemon.id === correctAnswer?.pokemonId
  );

  // Reset sync state when user changes (e.g., signs in/out)
  useEffect(() => {
    setHasSynced(false);
  }, [user?.id]);

  const handleShare = () => {
    posthog.capture("daily_challenge_share_clicked", {
      has_solved: hasSolved,
      num_guesses: guesses.length,
    });
    shareResults(guesses);
  };

  const handleSyncGuesses = async () => {
    if (!user || guesses.length === 0) return;

    try {
      setIsSyncing(true);
      const { syncedGuesses, existingGuesses, message } =
        await api.daily.syncGuesses(guesses, user.id, date);
      setHasSynced(true);

      if (existingGuesses.length > 0) {
        setGuesses({
          date,
          guesses: existingGuesses,
        });
      }

      if (syncedGuesses.length > 0) {
        toast({
          variant: "positive",
          description: (
            <div className="tw:flex tw:flex-nowrap">
              <CloudUpload className="tw:mr-2" />
              <div>Your guesses have been saved to your account!</div>
            </div>
          ),
        });
      }
    } catch (error) {
      console.error("Failed to sync guesses:", error);
      toast({
        variant: "destructive",
        description: "Something went wrong while saving your guesses.",
      });
    } finally {
      setIsSyncing(false);
    }
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
          <Button
            onClick={handleShare}
            className="tw:w-full"
            variant={isSuccess ? "default" : "outline"}
          >
            <Share2 className="tw:w-4 tw:h-4" />
            Share Results
          </Button>

          {/* Authentication Section */}
          {!authLoading && !user && (
            <div className="tw:flex tw:flex-col tw:items-center tw:gap-2">
              <GoogleSignInButton className="tw:w-full" />
              <p className="tw:text-sm tw:text-muted-foreground">
                Sign in to save your daily challenge results!
              </p>
            </div>
          )}

          {/* Sync Guesses Section */}
          {user && guesses.length > 0 && !hasSynced && (
            <div className="tw:flex tw:flex-col tw:items-center tw:gap-2">
              <Button
                onClick={handleSyncGuesses}
                disabled={isSyncing}
                variant="outline"
                className="tw:w-full"
              >
                <CloudUpload className="tw:w-4 tw:h-4" />
                {isSyncing ? "Saving..." : "Save Progress to Account"}
              </Button>
              <p className="tw:text-sm tw:text-muted-foreground tw:text-center">
                Save your {attempts} guess{attempts !== 1 ? "es" : ""} to your
                account for future reference
              </p>
            </div>
          )}

          {/* Sync Success Message */}
          {user && hasSynced && (
            <div className="tw:flex tw:items-center tw:justify-center tw:gap-2 tw:text-sm tw:text-positive">
              <CheckCircle className="tw:w-4 tw:h-4" />
              <span>Progress saved to your account!</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionDialog;
