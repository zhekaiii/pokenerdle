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

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- prefer type aliases
type StatSliderRowProps = {
  stat: StatKey;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const StatSliderRow: React.FC<StatSliderRowProps> = ({
  stat,
  value,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation("statGuess");
  const label = t(`sliders.${stat}`);
  const ariaLabel = t("sliders.ariaLabel", { stat: label });
  const inputAriaLabel = t("sliders.inputAriaLabel", { stat: label });

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

  return (
    <div className="tw:flex tw:items-center tw:gap-3">
      <div className="tw:w-24 tw:text-sm tw:font-medium">{label}</div>
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
      />
      <Input
        type="text"
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
        className="tw:w-14 tw:h-7 tw:px-2 tw:text-right tw:tabular-nums"
      />
    </div>
  );
};

export default StatSliderRow;
