import { createFileRoute } from "@tanstack/react-router";

const DailyArchivePage: React.FC = () => {
  return (
    <div className="tw:my-auto tw:flex tw:flex-col tw:items-center tw:gap-2 tw:text-center">
      <h1 className="tw:text-2xl tw:font-semibold">Past Challenges</h1>
      <p className="tw:text-muted-foreground">Coming soon.</p>
    </div>
  );
};

export const Route = createFileRoute("/daily/archive")({
  component: DailyArchivePage,
  context: () => ({
    shouldShowRuleButton: true,
  }),
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
