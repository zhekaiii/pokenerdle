import { createApi } from "@/api";
import DailyChallengeGameplay from "@/pages/DailyChallenge/components/Gameplay";
import DailyChallengeIntroCard from "@/pages/DailyChallenge/components/IntroCard";
import { FROZEN_DATE } from "@/pages/DailyChallenge/constants";
import {
  DailyChallenge,
  guessesAtom,
} from "@/pages/DailyChallenge/hooks/useData";
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
  return (
    <>
      {state === DailyChallengeState.Intro ? (
        <DailyChallengeIntroCard onStart={onStart} />
      ) : (
        <DailyChallengeGameplay />
      )}
    </>
  );
};

export const Route = createFileRoute("/daily")({
  component: DailyChallengePage,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  loader: async ({ context: { store } }): Promise<DailyChallenge | null> => {
    try {
      const today = import.meta.env.SSR
        ? format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd")
        : FROZEN_DATE;
      const api = createApi(store);
      const userGuesses = await api.daily.getUserGuesses(today);
      if (!userGuesses.length) return null;
      return {
        date: today,
        guesses: userGuesses,
      };
    } catch (error) {
      console.error("Error getting user guesses:", error);
      return null;
    }
  },
  head: ({ match }) => ({
    meta: [
      { title: match.context.t("meta:title.daily") },
      { property: "og:title", content: match.context.t("meta:title.daily") },
      {
        name: "description",
        content:
          match.context.t("meta:description.daily"),
      },
      {
        property: "og:description",
        content:
          match.context.t("meta:description.daily"),
      },
    ],
  }),
});
