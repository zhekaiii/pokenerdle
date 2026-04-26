import { createFileRoute } from "@tanstack/react-router";
import PokeChain from "../components/PokeChain";

export const Route = createFileRoute("/pokechain")({
  component: PokeChain,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  head: async ({ match }) => {
    await match.context.i18n.loadNamespaces("metadata");
    return {
      meta: [
        { title: match.context.i18n.t("metadata:title.pokechain") },
        {
          property: "og:title",
          content: match.context.i18n.t("metadata:title.pokechain"),
        },
        {
          name: "description",
          content: match.context.i18n.t("metadata:description.pokechain"),
        },
        {
          property: "og:description",
          content: match.context.i18n.t("metadata:description.pokechain"),
        },
      ],
    };
  },
});
