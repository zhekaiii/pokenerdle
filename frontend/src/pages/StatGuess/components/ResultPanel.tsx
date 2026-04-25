import { StatGuessScore } from "../scoring";
import React from "react";
import { useTranslation } from "react-i18next";

import { useCountdown } from "../hooks/useCountdown";
import CountdownButton from "./CountdownButton";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- prefer type aliases
type ResultPanelProps = {
  score: StatGuessScore;
  onAdvance: () => void;
};

const COUNTDOWN_MS = 8000;

const colorClass = (c: "green" | "yellow" | "gray") =>
  c === "green"
    ? "tw:bg-green-500/20 tw:border-green-500/40"
    : c === "yellow"
      ? "tw:bg-yellow-500/20 tw:border-yellow-500/40"
      : "tw:bg-muted tw:border-muted-foreground/20";

const ResultPanel: React.FC<ResultPanelProps> = ({ score, onAdvance }) => {
  const { t } = useTranslation("statGuess");
  const { progress } = useCountdown({
    durationMs: COUNTDOWN_MS,
    onComplete: onAdvance,
    active: true,
  });

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      <div className="tw:text-center tw:text-5xl tw:font-bold">
        {t("result.accuracy", { percent: score.overallPercent })}
      </div>
      <div className="tw:flex tw:flex-col tw:gap-2">
        {score.perStat.map((s) => (
          <div
            key={s.stat}
            className={`tw:flex tw:items-center tw:gap-3 tw:p-2 tw:border tw:rounded-md ${colorClass(s.color)}`}
          >
            <div className="tw:w-24 tw:text-sm tw:font-medium">
              {t(`sliders.${s.stat}`)}
            </div>
            <div className="tw:flex-1 tw:text-sm">
              {t("result.perStat", {
                guess: s.guess,
                actual: s.actual,
                delta: s.delta,
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="tw:flex tw:justify-center tw:pt-2">
        <CountdownButton
          progress={progress}
          onClick={onAdvance}
          ariaLabel={t("actions.nextIn", {
            seconds: Math.ceil((1 - progress) * (COUNTDOWN_MS / 1000)),
          })}
        >
          <span aria-hidden>▶</span>
        </CountdownButton>
      </div>
    </div>
  );
};

export default ResultPanel;
