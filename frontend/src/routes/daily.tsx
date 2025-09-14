import { createApi } from "@/api";
import { sessionAtom } from "@/atoms/auth";
import LoadingDialog from "@/components/recyclables/LoadingDialog";
import DailyChallengeGameplay from "@/pages/DailyChallenge/components/Gameplay";
import DailyChallengeIntroCard from "@/pages/DailyChallenge/components/IntroCard";
import { FROZEN_DATE } from "@/pages/DailyChallenge/constants";
import {
  DailyChallenge,
  guessesAtom,
} from "@/pages/DailyChallenge/hooks/useData";
import { useSyncData } from "@/pages/DailyChallenge/hooks/useSyncData";
import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { atom, useAtom, useStore } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

enum DailyChallengeState {
  Intro,
  Gameplay,
}

const dailyChallengeStateAtom = atom<DailyChallengeState>(
  DailyChallengeState.Intro
);

const DailyChallengePage: React.FC = () => {
  const loadedData = Route.useLoaderData();
  const store = useStore();
  useHydrateAtoms([[guessesAtom, loadedData ?? store.get(guessesAtom)]]);
  useHydrateAtoms([
    [
      dailyChallengeStateAtom,
      loadedData?.guesses?.length
        ? DailyChallengeState.Gameplay
        : DailyChallengeState.Intro,
    ],
  ]);
  const [state, setState] = useAtom(dailyChallengeStateAtom);
  const onStart = () => {
    setState(DailyChallengeState.Gameplay);
  };
  const { isSyncing } = useSyncData();
  return (
    <>
      {state === DailyChallengeState.Intro ? (
        <DailyChallengeIntroCard onStart={onStart} />
      ) : (
        <DailyChallengeGameplay />
      )}
      <LoadingDialog open={isSyncing} />
    </>
  );
};

export const Route = createFileRoute("/daily")({
  component: DailyChallengePage,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  head: () => ({
    meta: [
      { title: "Daily Challenge – PokéNerdle" },
      { property: "og:title", content: "Daily Challenge – PokéNerdle" },
      {
        name: "description",
        content:
          "Play the Daily Challenge and test your Pokémon knowledge! Guess the daily mystery Pokémon in 8 tries or less!",
      },
      {
        property: "og:description",
        content:
          "Play the Daily Challenge and test your Pokémon knowledge! Guess the daily mystery Pokémon in 8 tries or less!",
      },
    ],
  }),
  loader: async ({ context: { store } }): Promise<DailyChallenge | null> => {
    const session = store.get(sessionAtom);
    if (!session) return null;
    try {
      const today = import.meta.env.SSR
        ? format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd")
        : FROZEN_DATE;
      const api = createApi(store);
      const userGuesses = await api.daily.getUserGuesses(today);
      return {
        date: today,
        guesses: userGuesses,
        synced: true,
      };
    } catch (error) {
      console.error("Error getting user guesses:", error);
      return null;
    }
  },
});
