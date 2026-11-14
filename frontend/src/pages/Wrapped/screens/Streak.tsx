import type { WrappedStats } from "@pokenerdle/shared/wrapped";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  formatDayRange,
  placeStreak,
  STRIP_MONTH_DAYS,
  STRIP_MONTH_EDGES,
} from "../format";
import { cssVars, delay } from "../style";
import type { ScreenProps } from "../Story";
import { useCountUp } from "../useCountUp";
import classes from "../Wrapped.module.scss";

type StreakStats = NonNullable<WrappedStats["streak"]>;

const percent = (fraction: number) => `${fraction * 100}%`;

const StreakView: React.FC<{ streak: StreakStats }> = ({ streak }) => {
  const { t, i18n } = useTranslation("wrapped");
  const length = useCountUp(streak.length);
  const place = placeStreak(streak);
  const months = t("streak.months").split(",");
  return (
    <>
      <div className={clsx(classes.Tag, classes.Pop)}>{t("streak.tag")}</div>
      <div
        className={clsx(classes.Huge, classes.StreakCount, classes.Slam)}
        style={delay(".2s")}
      >
        {length}
      </div>
      <div className={clsx(classes.Sticker, classes.Pop)} style={delay(".7s")}>
        {t("streak.inARow")}
      </div>
      <div
        className={clsx(classes.Year, classes.Up)}
        style={cssVars({
          "--d": ".9s",
          "--l": percent(place.start),
          "--w": percent(place.length),
          "--f": place.centre,
        })}
      >
        <div className={clsx(classes.Flag, classes.Pop)} style={delay("1.5s")}>
          {formatDayRange(i18n.language, streak.start, streak.end)}
        </div>
        <div className={classes.Track}>
          {STRIP_MONTH_EDGES.map((edge) => (
            <i key={edge} className={classes.Tick} style={{ left: percent(edge) }} />
          ))}
          <b className={classes.StreakBlock} />
        </div>
        <div className={classes.Months}>
          {months.map((month, n) => (
            <span
              key={n}
              className={clsx(
                n >= place.firstMonth && n <= place.lastMonth && classes.MonthHit,
              )}
              style={{ flexGrow: STRIP_MONTH_DAYS[n] }}
            >
              {month}
            </span>
          ))}
        </div>
      </div>
      <div
        className={clsx(classes.Body, classes.BodyCenter, classes.Up)}
        style={delay("1.8s")}
      >
        {t("streak.body")}
      </div>
      <div className={classes.Grow} />
    </>
  );
};

const Streak: React.FC<ScreenProps> = ({ data }) =>
  data.stats?.streak ? <StreakView streak={data.stats.streak} /> : null;

export default Streak;
