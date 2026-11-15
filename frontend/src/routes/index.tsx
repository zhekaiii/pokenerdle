import { createApi } from "@/api";
import { posthogDistinctIdAtom } from "@/atoms/auth";
import { getNoticeNamespaces } from "@/components/Notice/namespaces";
import HomePage, { HomeSummary } from "@/pages/Home/HomePage";
import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import type { Notice } from "@pokenerdle/shared/notices";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import type { Store } from "jotai/vanilla/store";

const loadSummary = async (store: Store): Promise<HomeSummary | null> => {
  if (!store.get(posthogDistinctIdAtom)) return null;
  try {
    const api = createApi(store);
    const [stats, guesses] = await Promise.all([
      api.daily.getStats(),
      api.daily.getUserGuesses(
        format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd"),
      ),
    ]);
    return {
      streak: stats.streak,
      winRate: stats.win_rate,
      guesses,
    };
  } catch (error) {
    console.error("Error loading homepage daily summary:", error);
    return null;
  }
};

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async ({
    context: { store, i18n },
  }): Promise<{ summary: HomeSummary | null; notice: Notice | null }> => {
    const api = createApi(store);
    const [summary, notice] = await Promise.all([
      loadSummary(store),
      api.notices
        .get("home")
        .then(({ notice }) => notice)
        .catch((error) => {
          console.error("Error loading home notice:", error);
          return null;
        }),
    ]);
    // Load the notice's namespaces now so the SSR HTML is already translated.
    if (notice) await i18n.loadNamespaces(getNoticeNamespaces(notice));
    return { summary, notice };
  },
  head: async ({ match }) => {
    await match.context.i18n.loadNamespaces(["metadata", "home"]);
    return {
      meta: [
        { title: match.context.i18n.t("metadata:title.root") },
        {
          property: "og:title",
          content: match.context.i18n.t("metadata:title.root"),
        },
        {
          name: "description",
          content: match.context.i18n.t("metadata:description.root"),
        },
        {
          property: "og:description",
          content: match.context.i18n.t("metadata:description.root"),
        },
      ],
    };
  },
});
