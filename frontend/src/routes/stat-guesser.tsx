import StatGuesserPage from "@/pages/StatGuesser";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/stat-guesser")({
  component: StatGuesserPage,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  head: async ({ match }) => {
    await match.context.i18n.loadNamespaces("metadata");
    return {
      meta: [
        { title: match.context.i18n.t("metadata:title.statGuesser") },
        {
          property: "og:title",
          content: match.context.i18n.t("metadata:title.statGuesser"),
        },
        {
          name: "description",
          content: match.context.i18n.t("metadata:description.statGuesser"),
        },
        {
          property: "og:description",
          content: match.context.i18n.t("metadata:description.statGuesser"),
        },
      ],
    };
  },
});
