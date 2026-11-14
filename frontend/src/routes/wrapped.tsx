import WrappedPage from "@/pages/Wrapped";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/wrapped")({
  component: WrappedPage,
  context: () => ({
    hideChrome: true,
  }),
  head: async ({ match }) => {
    await match.context.i18n.loadNamespaces(["metadata", "wrapped"]);
    const title = match.context.i18n.t("wrapped:meta.title");
    return {
      meta: [
        { title },
        { property: "og:title", content: title },
      ],
    };
  },
});
