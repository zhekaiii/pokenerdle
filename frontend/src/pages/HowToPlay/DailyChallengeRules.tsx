import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import EffectivenessIcon from "../DailyChallenge/components/EffectivenessIcon";
import DailyChallengeGuessBox from "../DailyChallenge/components/Gameplay/components/DailyChallengeGuessBox";

const SQUARE_CLASS_POSITIVE =
  "tw:rounded-xs tw:bg-positive tw:size-6 tw:[&_svg]:m-auto tw:flex";
const SQUARE_CLASS_AMBER =
  "tw:rounded-xs tw:bg-amber-500 tw:size-6 tw:[&_svg]:m-auto tw:flex";
const ICON_EXPLANATION_TABLE_CLASS =
  "tw:grid tw:grid-cols-[max-content_max-content_auto] tw:items-start tw:mt-2 tw:gap-2";

const EXAMPLE_GUESSES: DailyChallengeGuessResponse[] = [
  {
    pokemon: {
      type1: "Fire",
      type2: "Flying",
      height: 17,
      color: "red",
      generationId: 1,
    },
    pokemonId: 6,
    type1Correctness: 0.5,
    type2Correctness: "=",
    genCorrectness: "=",
    heightCorrectness: ">",
    colorCorrectness: false,
  },
  {
    pokemon: {
      type1: "Water",
      type2: null,
      height: 6,
      color: "blue",
      generationId: 2,
    },
    pokemonId: 158,
    type1Correctness: "=",
    type2Correctness: "NA",
    genCorrectness: "<",
    heightCorrectness: ">",
    colorCorrectness: true,
  },
];

const DailyChallengeRules: React.FC = () => {
  const { t } = useTranslation("rules");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="tw:text-3xl tw:text-center">
          {t("daily.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="tw:space-y-6">
        <a
          href="#example"
          className="tw:text-muted-foreground tw:underline tw:mb-2 tw:block"
        >
          {t("daily.jumpToExamples")}
        </a>
        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">
            {t("daily.objective.title")}
          </h2>
          <p
            dangerouslySetInnerHTML={{
              __html: t("daily.objective.description"),
            }}
          />
          <div>
            <ul className="tw:list-disc tw:ps-6 tw:text-muted-foreground">
              <li>{t("daily.objective.features.dailyPokemon")}</li>
              <li>{t("daily.objective.features.sharedPokemon")}</li>
              <li>{t("daily.objective.features.useClues")}</li>
              <li>{t("daily.objective.features.shareResults")}</li>
            </ul>
          </div>
        </section>

        <section className="tw:flex tw:flex-col tw:gap-4">
          <h2 className="tw:text-xl tw:font-semibold">
            {t("daily.howCluesWork.title")}
          </h2>
          <p>{t("daily.howCluesWork.introduction")}</p>

          <Card className="tw:bg-muted tw:gap-3">
            <CardHeader>
              <CardTitle>{t("daily.howCluesWork.types.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {t("daily.howCluesWork.types.description")}
              <CardDescription>
                {t("daily.howCluesWork.types.matchDescription")}
              </CardDescription>
              <div className={ICON_EXPLANATION_TABLE_CLASS}>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={4} />
                </div>
                <b>{t("daily.howCluesWork.types.damageLevels.4x.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t("daily.howCluesWork.types.damageLevels.4x.description")}
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={2} />
                </div>
                <b>{t("daily.howCluesWork.types.damageLevels.2x.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t("daily.howCluesWork.types.damageLevels.2x.description")}
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={1} />
                </div>
                <b>{t("daily.howCluesWork.types.damageLevels.1x.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t("daily.howCluesWork.types.damageLevels.1x.description")}
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={0.5} />
                </div>
                <b>{t("daily.howCluesWork.types.damageLevels.0_5x.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t("daily.howCluesWork.types.damageLevels.0_5x.description")}
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={0.25} />
                </div>
                <b>{t("daily.howCluesWork.types.damageLevels.0_25x.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t("daily.howCluesWork.types.damageLevels.0_25x.description")}
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={0} />
                </div>
                <b>{t("daily.howCluesWork.types.damageLevels.0x.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t("daily.howCluesWork.types.damageLevels.0x.description")}
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value="NA" />
                </div>
                <b>{t("daily.howCluesWork.types.damageLevels.na.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t("daily.howCluesWork.types.damageLevels.na.description")}
                </span>
                <div className={SQUARE_CLASS_POSITIVE}>
                  <Check />
                </div>
                <b>{t("daily.howCluesWork.types.damageLevels.match.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t("daily.howCluesWork.types.damageLevels.match.description")}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="tw:bg-muted tw:gap-3">
            <CardHeader>
              <CardTitle>{t("daily.howCluesWork.generation.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {t("daily.howCluesWork.generation.description")}
              <CardDescription>
                {t("daily.howCluesWork.generation.rangeDescription")}
              </CardDescription>
              <div className={ICON_EXPLANATION_TABLE_CLASS}>
                <div className={SQUARE_CLASS_AMBER}>
                  <ChevronUp />
                </div>
                <b>
                  {t("daily.howCluesWork.generation.indicators.newer.label")}
                </b>{" "}
                <span className="tw:text-muted-foreground">
                  {t(
                    "daily.howCluesWork.generation.indicators.newer.description"
                  )}
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <ChevronDown />
                </div>
                <b>
                  {t("daily.howCluesWork.generation.indicators.older.label")}
                </b>{" "}
                <span className="tw:text-muted-foreground">
                  {t(
                    "daily.howCluesWork.generation.indicators.older.description"
                  )}
                </span>
                <div className={SQUARE_CLASS_POSITIVE}>
                  <Check />
                </div>
                <b>
                  {t("daily.howCluesWork.generation.indicators.match.label")}
                </b>{" "}
                <span className="tw:text-muted-foreground">
                  {t(
                    "daily.howCluesWork.generation.indicators.match.description"
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="tw:bg-muted tw:gap-3">
            <CardHeader>
              <CardTitle>{t("daily.howCluesWork.color.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {t("daily.howCluesWork.color.description")}
              <CardDescription>
                {t("daily.howCluesWork.color.classificationDescription")}
              </CardDescription>
              <div className={ICON_EXPLANATION_TABLE_CLASS}>
                <div className={SQUARE_CLASS_POSITIVE}>
                  <Check />
                </div>
                <b>{t("daily.howCluesWork.color.indicators.match.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t("daily.howCluesWork.color.indicators.match.description")}
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <X />
                </div>
                <b>
                  {t("daily.howCluesWork.color.indicators.different.label")}
                </b>{" "}
                <span className="tw:text-muted-foreground">
                  {t(
                    "daily.howCluesWork.color.indicators.different.description"
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="tw:bg-muted tw:gap-3">
            <CardHeader>
              <CardTitle>{t("daily.howCluesWork.height.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {t("daily.howCluesWork.height.description")}
              <CardDescription>
                {t("daily.howCluesWork.height.measurementDescription")}
              </CardDescription>
              <div className={ICON_EXPLANATION_TABLE_CLASS}>
                <div className={SQUARE_CLASS_AMBER}>
                  <ChevronUp />
                </div>
                <b>{t("daily.howCluesWork.height.indicators.taller.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t("daily.howCluesWork.height.indicators.taller.description")}
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <ChevronDown />
                </div>
                <b>{t("daily.howCluesWork.height.indicators.shorter.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t(
                    "daily.howCluesWork.height.indicators.shorter.description"
                  )}
                </span>
                <div className={SQUARE_CLASS_POSITIVE}>
                  <Check />
                </div>
                <b>{t("daily.howCluesWork.height.indicators.match.label")}</b>{" "}
                <span className="tw:text-muted-foreground">
                  {t("daily.howCluesWork.height.indicators.match.description")}
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="example">
          <h2 className="tw:text-xl tw:font-semibold tw:mb-2">
            {t("daily.examples.title")}
          </h2>
          <p className="tw:mb-2">{t("daily.examples.description")}</p>

          <div className="tw:flex tw:flex-col tw:gap-2 tw:mx-auto tw:max-w-[400px]">
            {EXAMPLE_GUESSES.map((guess) => (
              <DailyChallengeGuessBox
                key={guess.pokemonId}
                guess={guess}
                forceOpen
              />
            ))}
          </div>
        </section>
      </CardContent>
      <CardFooter>
        <Button asChild className="tw:flex-grow">
          <Link to="/daily">{t("daily.buttons.playNow")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export const Component = DailyChallengeRules;

Component.displayName = "DailyChallengeRules";

export default Component;
