import api from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useAtom } from "jotai";
import { CloudUpload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DAILY_CHALLENGE_GUESS_LIMIT, FROZEN_DATE } from "../constants";
import { guessesAtom } from "./useData";

export const useSyncData = () => {
  const [guesses, setGuesses] = useAtom(guessesAtom);
  const { isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncGuesses = useCallback(async () => {
    if (!isAuthenticated || !guesses || guesses.guesses.length === 0) return;

    try {
      setIsSyncing(true);
      const { syncedGuesses, existingGuesses } = await api.daily.syncGuesses(
        guesses.guesses,
        guesses.date
      );

      if (existingGuesses.length > 0) {
        setGuesses({
          date: guesses.date,
          guesses: existingGuesses,
          synced: true,
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
        setGuesses({
          date: guesses.date,
          guesses: syncedGuesses,
          synced: true,
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
  }, [guesses, isAuthenticated, setGuesses, toast]);

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    if (
      guesses &&
      guesses.guesses.length > 0 &&
      (guesses.guesses.length == DAILY_CHALLENGE_GUESS_LIMIT ||
        guesses.guesses[guesses.guesses.length - 1].correct)
    )
      return;
    setIsSyncing(true);
    api.daily
      .getUserGuesses(FROZEN_DATE)
      .then((userGuesses) => {
        setGuesses({
          date: FROZEN_DATE,
          guesses: userGuesses,
          synced: true,
        });
      })
      .finally(() => {
        setIsSyncing(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !guesses ||
      guesses.synced ||
      guesses.guesses.length === 0 ||
      loading
    )
      return;
    handleSyncGuesses();
  }, [isAuthenticated, guesses, loading, handleSyncGuesses]);

  return { isSyncing };
};
