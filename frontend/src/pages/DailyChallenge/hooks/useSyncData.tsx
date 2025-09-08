import api from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useAtom } from "jotai";
import { CloudUpload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
