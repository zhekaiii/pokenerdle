import api from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { useWatch } from "@/hooks/useWatch";
import { useAtom } from "jotai";
import { CloudUpload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DAILY_CHALLENGE_GUESS_LIMIT, FROZEN_DATE } from "../constants";
import { guessesAtom } from "./useData";

export const useSyncData = () => {
  const [guesses, setGuesses] = useAtom(guessesAtom);
  const { isAuthenticated, loading } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const { t } = useTranslation("daily");

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
        toast.success(t("sync.success"), {
          icon: <CloudUpload />,
        });
        setGuesses({
          date: guesses.date,
          guesses: syncedGuesses,
          synced: true,
        });
      }
    } catch (error) {
      console.error("Failed to sync guesses:", error);
      toast.error(t("sync.error"));
    } finally {
      setIsSyncing(false);
    }
  }, [guesses, isAuthenticated, setGuesses, t]);

  useWatch(
    ([oldAuthenticated], [newAuthenticated]) => {
      if (
        loading ||
        oldAuthenticated === undefined ||
        oldAuthenticated ||
        !newAuthenticated
      )
        return;
      // At this point, loading is false and oldAuthenticated is false and newAuthenticated is true,
      // meaning user just logged in
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
    },
    [isAuthenticated, loading] as const
  );

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
