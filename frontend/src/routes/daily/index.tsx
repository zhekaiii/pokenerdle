import { createApi } from "@/api";
import DailyChallengeGameplay from "@/pages/DailyChallenge/components/Gameplay";
import DailyChallengeIntroCard from "@/pages/DailyChallenge/components/IntroCard";
import { DAY_1, FROZEN_DATE } from "@/pages/DailyChallenge/constants";
import {
  DailyChallenge,
  guessesAtom,
} from "@/pages/DailyChallenge/hooks/useData";
import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format, isValid, parseISO } from "date-fns";
import { atom, useAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

enum DailyChallengeState {
  Intro,
  Gameplay,
}

const dailyChallengeStateAtom = atom<DailyChallengeState>(
  DailyChallengeState.Intro
);

interface DailySearchParams {
  date?: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FIRST_DATE = format(DAY_1, "yyyy-MM-dd");

const getToday = () =>
  import.meta.env.SSR
    ? format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd")
    : FROZEN_DATE;

const isValidChallengeDate = (date: string): boolean => {
  if (!DATE_PATTERN.test(date)) return false;
  const parsed = parseISO(date);
  if (!isValid(parsed) || format(parsed, "yyyy-MM-dd") !== date) return false;
  return date >= FIRST_DATE && date <= getToday();
};

const DailyChallengePage: React.FC = () => {
  const loadedData = Route.useLoaderData();
  const { date } = Route.useSearch();
  useHydrateAtoms([[guessesAtom, loadedData]]);
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
        <DailyChallengeIntroCard onStart={onStart} date={date} />
      ) : (
        <DailyChallengeGameplay date={date} />
      )}
    </>
  );
};

export const Route = createFileRoute("/daily/")({
  component: DailyChallengePage,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  validateSearch: (search: Record<string, unknown>): DailySearchParams => {
    const date = search.date;
    if (typeof date !== "string" || !isValidChallengeDate(date)) {
      return {};
    }
    return { date };
  },
  beforeLoad: ({ search }) => {
    // Normalize: if date param equals today, redirect without it
    if (search.date === getToday()) {
      throw redirect({ to: "/daily", search: {}, replace: true });
    }
    return { archiveDate: search.date };
  },
  loaderDeps: ({ search: { date } }) => ({ date }),
  loader: async ({
    context: { store },
    deps: { date: archiveDate },
  }): Promise<DailyChallenge | null> => {
    try {
      const date = archiveDate ?? getToday();
      const api = createApi(store);
      const userGuesses = await api.daily.getUserGuesses(date);
      if (!userGuesses.length) return null;
      return {
        date,
        guesses: userGuesses,
      };
    } catch (error) {
      console.error("Error getting user guesses:", error);
      return null;
    }
  },
  head: async ({ match }) => {
    await match.context.i18n.loadNamespaces("metadata");
    return {
      meta: [
        { title: match.context.i18n.t("metadata:title.daily") },
        {
          property: "og:title",
          content: match.context.i18n.t("metadata:title.daily"),
        },
        {
          name: "description",
          content: match.context.i18n.t("metadata:description.daily"),
        },
        {
          property: "og:description",
          content: match.context.i18n.t("metadata:description.daily"),
        },
      ],
    };
  },
});
