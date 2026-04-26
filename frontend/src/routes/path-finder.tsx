import { createApi } from "@/api";
import PathFinderGame from "@/components/PathFinder/PathFinderGame";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/path-finder")({
  component: PathFinderGame,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  head: async ({ match }) => {
    await match.context.i18n.loadNamespaces("metadata");
    return {
      meta: [
        { title: match.context.i18n.t("metadata:title.pathFinder") },
        {
          property: "og:title",
          content: match.context.i18n.t("metadata:title.pathFinder"),
        },
        {
          name: "description",
          content: match.context.i18n.t("metadata:description.pathFinder"),
        },
        {
          property: "og:description",
          content: match.context.i18n.t("metadata:description.pathFinder"),
        },
      ],
    };
  },
  loader: async ({ context: { store } }) => {
    const api = createApi(store);
    return await api.pathfinder.getChallenge();
  },
});
