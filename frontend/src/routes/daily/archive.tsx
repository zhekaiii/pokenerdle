import { createApi } from "@/api";
import CalendarArchivePage from "@/pages/DailyChallenge/Archive";
import { DAY_1, FROZEN_DATE } from "@/pages/DailyChallenge/constants";
import { TZDate } from "@date-fns/tz";
import { DailyChallengeCalendarResponse } from "@pokenerdle/shared/daily";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";

export interface ArchiveLoaderData {
  month: string;
  data: DailyChallengeCalendarResponse | null;
}

interface ArchiveSearchParams {
  month?: string;
}

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

const getCurrentMonth = () =>
  (import.meta.env.SSR
    ? format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd")
    : FROZEN_DATE
  ).slice(0, 7);

const FIRST_MONTH = format(DAY_1, "yyyy-MM");

const clampMonth = (month: string): string => {
  const current = getCurrentMonth();
  if (month < FIRST_MONTH) return FIRST_MONTH;
  if (month > current) return current;
  return month;
};

export const Route = createFileRoute("/daily/archive")({
  component: CalendarArchivePage,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  validateSearch: (search: Record<string, unknown>): ArchiveSearchParams => {
    const month = search.month;
    if (typeof month !== "string" || !MONTH_PATTERN.test(month)) {
      return {};
    }
    const clamped = clampMonth(month);
    // Omit the param when it resolves to the current month so the URL stays clean.
    if (clamped === getCurrentMonth()) return {};
    return { month: clamped };
  },
  beforeLoad: ({ search }) => {
    if (search.month === getCurrentMonth()) {
      throw redirect({ to: "/daily/archive", search: {}, replace: true });
    }
  },
  loaderDeps: ({ search: { month } }) => ({ month }),
  loader: async ({
    context: { store },
    deps: { month: monthParam },
  }): Promise<ArchiveLoaderData> => {
    const month = monthParam ?? getCurrentMonth();

    // Only block on the API during SSR so the initial HTML is populated.
    // Client-side month navigations should be instant; useQuery + LoadingDialog
    // handle the fetch without blocking the route transition.
    if (!import.meta.env.SSR) {
      return { month, data: null };
    }

    const api = createApi(store);
    try {
      const data = await api.daily.getCalendar(month);
      return { month, data };
    } catch (error) {
      console.error("Error loading calendar:", error);
      return { month, data: null };
    }
  },
  head: async ({ match }) => {
    await match.context.i18n.loadNamespaces(["daily", "metadata"]);
    const title = `${match.context.i18n.t("daily:calendar.title")} – PokéNerdle`;
    return {
      meta: [
        { title },
        { property: "og:title", content: title },
        {
          name: "description",
          content: match.context.i18n.t("daily:calendar.description"),
        },
      ],
    };
  },
});
