import { Slider } from "@/components/ui/Slider";
import { SLIDER_MAX, SLIDER_MIN, StatKey } from "@pokenerdle/shared";
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
      />
      <div className="tw:w-12 tw:text-right tw:tabular-nums">{value}</div>
    </div>
  );
};

export default StatSliderRow;
