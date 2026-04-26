import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Link } from "@tanstack/react-router";
import React from "react";
import { Trans, useTranslation } from "react-i18next";

const HOW_TO_PLAY_STEPS = [
  "revealed",
  "sliders",
  "submit",
  "feedback",
  "next",
] as const;

const StatGuesserRules: React.FC = () => {
  const { t } = useTranslation("rules");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="tw:text-3xl tw:text-center">
          {t("statGuesser.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="tw:space-y-6">
        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">
            {t("statGuesser.objective.title")}
          </h2>
          <p>
            <Trans
              ns="rules"
              i18nKey="statGuesser.objective.description"
              components={{ strong: <strong /> }}
            />
          </p>
        </section>

        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">
            {t("statGuesser.howToPlay.title")}
          </h2>
          <ol className="tw:list-decimal tw:ms-4 tw:space-y-2">
            {HOW_TO_PLAY_STEPS.map((step) => (
              <li key={step}>
                <Trans
                  ns="rules"
                  i18nKey={`statGuesser.howToPlay.steps.${step}`}
                  components={{ em: <em /> }}
                />
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">
            {t("statGuesser.filters.title")}
          </h2>
          <p>{t("statGuesser.filters.description")}</p>
        </section>

        <Button asChild className="tw:flex">
          <Link to="/stat-guesser">{t("statGuesser.buttons.playNow")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export const Component = StatGuesserRules;
Component.displayName = "StatGuesserRules";

export default Component;
