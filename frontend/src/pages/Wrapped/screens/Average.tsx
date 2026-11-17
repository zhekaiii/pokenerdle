import type { WrappedStats } from "@pokenerdle/shared/wrapped";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { delay } from "../style";
import type { ScreenProps } from "../Story";
import { useCountUp } from "../useCountUp";
import classes from "../Wrapped.module.scss";

// When the number appears, in seconds. The same value sets the entrance delay and starts the count.
const NUMBER_AT = 0.5;

const AverageView: React.FC<{ stats: WrappedStats; average: number }> = ({
  stats,
  average,
}) => {
  const { t } = useTranslation("wrapped");
  const shown = useCountUp(average, { decimals: 1, delaySeconds: NUMBER_AT });
  return (
    <>
      <div className={clsx(classes.Tag, classes.Pop)}>{t("average.tag")}</div>
      <div className={clsx(classes.Lead, classes.Up)} style={delay(0.2)}>
        {t("average.lead")}
      </div>
      <div
        className={clsx(classes.Huge, classes.AverageNumber, classes.Slam)}
        style={delay(NUMBER_AT)}
      >
        {shown.toFixed(1)}
      </div>
      <div className={clsx(classes.Sticker, classes.Pop)} style={delay(1.1)}>
        {t("average.unit")}
      </div>
      <div className={classes.Grow} />
      <div
        className={clsx(classes.Body, classes.BodyCenter, classes.Up)}
        style={delay(1.4)}
      >
        {t("average.body", { count: stats.daysSolved })}
      </div>
    </>
  );
};

const Average: React.FC<ScreenProps> = ({ data }) =>
  data.stats && data.stats.average !== null ? (
    <AverageView stats={data.stats} average={data.stats.average} />
  ) : null;

export default Average;
