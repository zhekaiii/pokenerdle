import type { WrappedResponse, WrappedStats } from "@pokenerdle/shared/wrapped";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  formatDay,
  formatSolveClock,
  isMinutesClock,
  pokemonInfo,
  toLongestBattle,
  toSolveSeconds,
} from "../format";
import { delay } from "../style";
import type { ScreenProps } from "../Story";
import { useCountUp } from "../useCountUp";
import classes from "../Wrapped.module.scss";
import Artwork from "./Artwork";

type ClockStats = NonNullable<WrappedStats["clock"]>;

const ClockView: React.FC<{ data: WrappedResponse; clock: ClockStats }> = ({
  data,
  clock,
}) => {
  const { t, i18n } = useTranslation("wrapped");
  const fastest = pokemonInfo(data, clock.fastest.pokemonId, i18n.language);
  const seconds = toSolveSeconds(clock.fastest.ms);
  const asMinutes = isMinutesClock(seconds);
  const shown = useCountUp(seconds);
  const longest = clock.longest;
  const longestMon =
    longest && pokemonInfo(data, longest.pokemonId, i18n.language);
  const longestTime = longest && toLongestBattle(longest.ms);
  return (
    <>
      <div className={clsx(classes.Tag, classes.Pop)}>{t("clock.tag")}</div>
      <div
        className={clsx(classes.Panel, classes.FastPanel, classes.Pop)}
        style={delay(".2s")}
      >
        <div className={classes.FastText}>
          <div className={classes.PanelSub}>{t("clock.fastest")}</div>
          <div
            className={clsx(
              classes.Huge,
              classes.FastTime,
              asMinutes && classes.FastTimeLong,
            )}
          >
            {formatSolveClock(shown, asMinutes)}
          </div>
          <div className={classes.FastUnit}>
            {t(asMinutes ? "clock.minutesFlat" : "clock.secondsFlat")}
          </div>
        </div>
        <div className={clsx(classes.Burst, classes.FastBurst)}>
          <Artwork src={fastest.artwork} alt={fastest.name} />
        </div>
        <div className={clsx(classes.Body, classes.FastFoot)}>
          {t("clock.fastestLine", {
            date: formatDay(i18n.language, clock.fastest.date),
            name: fastest.name,
          })}
        </div>
      </div>
      {longest && longestMon && longestTime && (
        <div
          className={clsx(classes.Panel, classes.LongPanel, classes.Pop)}
          style={delay(".9s")}
        >
          <div className={clsx(classes.Burst, classes.LongBurst)}>
            <Artwork src={longestMon.artwork} alt={longestMon.name} />
          </div>
          <div>
            <div className={classes.PanelSub}>{t("clock.longest")}</div>
            <div className={classes.LongTime}>
              {t(`clock.${longestTime.unit}`, { count: longestTime.count })}
            </div>
            <div className={clsx(classes.Body, classes.LongLine)}>
              {t("clock.longestLine", {
                date: formatDay(i18n.language, longest.date),
                name: longestMon.name,
              })}
            </div>
          </div>
        </div>
      )}
      <div className={classes.Grow} />
    </>
  );
};

const Clock: React.FC<ScreenProps> = ({ data }) =>
  data.stats?.clock ? <ClockView data={data} clock={data.stats.clock} /> : null;

export default Clock;
