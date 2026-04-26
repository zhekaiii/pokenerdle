import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import {
  SLIDER_MAX,
  SLIDER_MIN,
  StatKey,
  statRankColor,
} from "@pokenerdle/shared";
import React from "react";
import { useTranslation } from "react-i18next";

import type { StatBreakdown } from "../scoring";

interface StatSliderRowProps {
  stat: StatKey;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  result?: StatBreakdown;
}

const percentForValue = (value: number): number => {
  const clamped = Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, value));
  return ((clamped - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
};

const deltaBubbleText = (guess: number, actual: number): string => {
  const delta = Math.abs(actual - guess);
  if (delta === 0) return `${guess} (=)`;
  const arrow = guess < actual ? "↑" : "↓";
  return `${guess} (${arrow}${delta})`;
};

type DeltaAriaKey =
  | "result.statAriaExact"
  | "result.statAriaTooHigh"
  | "result.statAriaTooLow";

const deltaAriaKey = (guess: number, actual: number): DeltaAriaKey => {
  if (guess === actual) return "result.statAriaExact";
  return guess < actual ? "result.statAriaTooLow" : "result.statAriaTooHigh";
};

const StatSliderRow: React.FC<StatSliderRowProps> = ({
  stat,
  value,
  onChange,
  disabled,
  result,
}) => {
  const { t } = useTranslation("statGuesser");
  const label = t(`sliders.${stat}`);
  const ariaLabel = t("sliders.ariaLabel", { stat: label });
  const inputAriaLabel = t("sliders.inputAriaLabel", { stat: label });
  const isResult = Boolean(result);

  const [text, setText] = React.useState(String(value));

  React.useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = () => {
    const n = parseInt(text, 10);
    if (Number.isNaN(n)) {
      setText(String(value));
      return;
    }
    const clamped = Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, n));
    setText(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  const actualValue = result?.actual ?? value;
  const guessPercent = result
    ? percentForValue(result.guess)
    : percentForValue(value);
  const actualPercent = percentForValue(actualValue);

  const [displayActualPercent, setDisplayActualPercent] = React.useState(() =>
    isResult ? guessPercent : actualPercent,
  );

  React.useEffect(() => {
    if (!isResult) {
      setDisplayActualPercent(actualPercent);
      return;
    }
    setDisplayActualPercent(guessPercent);
    const frame = requestAnimationFrame(() => {
      setDisplayActualPercent(actualPercent);
    });
    return () => cancelAnimationFrame(frame);
  }, [actualPercent, guessPercent, isResult]);

  const bubbleText = result ? deltaBubbleText(result.guess, result.actual) : "";
  const statAria =
    result &&
    t(deltaAriaKey(result.guess, result.actual), {
      actual: result.actual,
      delta: result.delta,
      guess: result.guess,
      stat: label,
    });

  return (
    <>
      <div className="tw:text-sm tw:font-medium">{label}</div>
      {isResult && result ? (
        <div
          className="tw:relative tw:h-3.5 tw:rounded-[3px] tw:bg-primary/20"
          role="img"
          aria-label={statAria || undefined}
        >
          <div
            className="tw:h-full tw:rounded-[3px] tw:transition-[width,background-color] tw:duration-300 tw:motion-reduce:transition-none"
            style={{
              backgroundColor: statRankColor(result.actual),
              width: `${displayActualPercent}%`,
            }}
          />
          <div
            className="tw:absolute tw:top-1/2 tw:h-5 tw:w-[3px] tw:-translate-x-1/2 tw:-translate-y-1/2 tw:rounded-full tw:bg-white tw:shadow-[0_0_0_1.5px_rgba(0,0,0,0.7)] tw:transition-[left] tw:duration-300 tw:motion-reduce:transition-none"
            style={{ left: `${guessPercent}%` }}
            aria-hidden
          >
            <div className="tw:absolute tw:bottom-6 tw:left-1/2 tw:-translate-x-1/2 tw:whitespace-nowrap tw:rounded-md tw:border tw:border-white/15 tw:bg-background tw:px-2 tw:py-0.5 tw:text-xs tw:font-semibold tw:tabular-nums tw:text-foreground tw:shadow-md">
              {bubbleText}
              <span className="tw:absolute tw:left-1/2 tw:top-full tw:-translate-x-1/2 tw:border-4 tw:border-transparent tw:border-t-background" />
            </div>
          </div>
        </div>
      ) : (
        <Slider
          className="tw:flex-1"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={1}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          disabled={disabled}
          aria-label={ariaLabel}
          fillColor={statRankColor(value)}
          trackClassName="tw:h-3.5 tw:rounded-[3px] tw:bg-primary/20"
          rangeClassName="tw:transition-[width,background-color] tw:duration-300 tw:motion-reduce:transition-none"
          thumbClassName="tw:h-4 tw:w-4"
        />
      )}
      {isResult && result ? (
        <div className="tw:text-right tw:text-sm tw:font-semibold tw:tabular-nums">
          {result.actual}
        </div>
      ) : (
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={commit}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit();
              e.currentTarget.blur();
            }
          }}
          disabled={disabled}
          aria-label={inputAriaLabel}
          className="tw:h-7 tw:w-16 tw:px-2 tw:text-right tw:tabular-nums"
        />
      )}
    </>
  );
};

export default StatSliderRow;
