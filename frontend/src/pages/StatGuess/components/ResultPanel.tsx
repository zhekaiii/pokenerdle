import React from "react";
import { useTranslation } from "react-i18next";

import { useCountdown } from "../hooks/useCountdown";
import CountdownButton from "./CountdownButton";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- prefer type aliases
type ResultPanelProps = {
  onAdvance: () => void;
};

const COUNTDOWN_MS = 8000;

const ResultPanel: React.FC<ResultPanelProps> = ({ onAdvance }) => {
  const { t } = useTranslation("statGuess");
  const { progress } = useCountdown({
    durationMs: COUNTDOWN_MS,
    onComplete: onAdvance,
    active: true,
  });

  return (
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
  );
};

export default ResultPanel;
