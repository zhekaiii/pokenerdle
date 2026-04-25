import { createApi } from "@/api";
import { posthogDistinctIdAtom } from "@/atoms/auth";
import HomePage, { HomeSummary } from "@/pages/Home/HomePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async ({ context: { store } }): Promise<HomeSummary | null> => {
    if (!store.get(posthogDistinctIdAtom)) return null;
    try {
      const api = createApi(store);
      const [stats, guesses] = await Promise.all([
        api.daily.getStats(),
        api.daily.getUserGuesses(),
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
