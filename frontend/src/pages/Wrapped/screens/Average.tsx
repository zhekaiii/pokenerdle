import type { WrappedStats } from "@pokenerdle/shared/wrapped";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { delay } from "../style";
import type { ScreenProps } from "../Story";
import { useCountUp } from "../useCountUp";
import classes from "../Wrapped.module.scss";

const AverageView: React.FC<{ stats: WrappedStats; average: number }> = ({
  stats,
  average,
}) => {
  const { t } = useTranslation("wrapped");
  const shown = useCountUp(average, { decimals: 1 });
  return (
    <>
      <div className={clsx(classes.Tag, classes.Pop)}>{t("average.tag")}</div>
      <div className={clsx(classes.Lead, classes.Up)} style={delay(".2s")}>
        {t("average.lead")}
      </div>
      <div
        className={clsx(classes.Huge, classes.AverageNumber, classes.Slam)}
        style={delay(".5s")}
      >
        {shown.toFixed(1)}
      </div>
      <div className={clsx(classes.Sticker, classes.Pop)} style={delay("1.1s")}>
        {t("average.unit")}
      </div>
      <div className={classes.Grow} />
      <div
        className={clsx(classes.Body, classes.BodyCenter, classes.Up)}
        style={delay("1.4s")}
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
