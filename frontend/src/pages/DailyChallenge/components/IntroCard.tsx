import questionMarkIcon from "@/assets/question_mark_big.png";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Link } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { challengeNumber, getChallengeNumber } from "../constants";
import { useDailyChallengeData } from "../hooks/useData";

interface Props {
  onStart: () => void;
  date?: string;
}

const DailyChallengeIntroCard: React.FC<Props> = ({ onStart, date }) => {
  const { guesses, isGameFinished } = useDailyChallengeData(date);
  const { t } = useTranslation("daily");
  const displayNumber = date ? getChallengeNumber(date) : challengeNumber;

  return (
    <Card className="tw:relative tw:w-[300px] tw:my-auto">
      <CardHeader className="tw:text-center">
        <CardTitle className="tw:text-2xl">{t("title")}</CardTitle>
        <CardDescription>
          {t("challengeNumber", { number: displayNumber })}
        </CardDescription>
      </CardHeader>
      <CardContent className="tw:flex tw:flex-col tw:items-center">
        <img src={questionMarkIcon} />
      </CardContent>
      <CardFooter className="tw:flex tw:flex-col tw:gap-2">
        <Button
          className="tw:w-full"
          onClick={onStart}
          suppressHydrationWarning
        >
          {isGameFinished
            ? t("buttons.viewStats")
            : !guesses?.guesses.length
            ? t("buttons.startGuessing")
            : t("buttons.continueGuessing")}
        </Button>
        <Button className="tw:w-full" variant="outline">
          <Link to="/how-to-play/daily">{t("nav:howToPlay")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyChallengeIntroCard;
