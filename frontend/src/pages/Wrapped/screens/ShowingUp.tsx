import type { WrappedResponse, WrappedStats } from "@pokenerdle/shared/wrapped";
import clsx from "clsx";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { pokemonInfo } from "../format";
import { delay } from "../style";
import type { ScreenProps } from "../Story";
import { useCountUp } from "../useCountUp";
import classes from "../Wrapped.module.scss";
import Artwork from "./Artwork";

const MAX_THUMBNAILS = 6;

const ShowingUpView: React.FC<{ data: WrappedResponse; stats: WrappedStats }> = ({
  data,
  stats,
}) => {
  const { t, i18n } = useTranslation("wrapped");
  const days = useCountUp(stats.daysPlayed);
  const unique = useCountUp(stats.uniquePokemon);
  return (
    <>
      <div className={clsx(classes.Tag, classes.Pop)}>{t("showingUp.tag")}</div>
      <div
        className={clsx(classes.Huge, classes.ShowingUpCount, classes.Slam)}
        style={delay(".2s")}
      >
        {days}
      </div>
      <div
        className={clsx(classes.Sticker, classes.StickerSmall, classes.Pop)}
        style={delay(".7s")}
      >
        {t("showingUp.days")}
      </div>
      <div className={classes.Grow} />
      <div className={classes.Mons}>
        {stats.mostGuessed.slice(0, MAX_THUMBNAILS).map((id, n) => {
          const mon = pokemonInfo(data, id, i18n.language);
          return (
            <Artwork
              key={id}
              className={clsx(classes.Mon, classes.Pop)}
              style={delay(`${(1 + n * 0.08).toFixed(2)}s`)}
              src={mon.artwork}
              alt={mon.name}
            />
          );
        })}
      </div>
      <div className={clsx(classes.Line, classes.Up)} style={delay("1.5s")}>
        <Trans
          t={t}
          i18nKey="showingUp.unique"
          values={{ n: unique }}
          components={{ em: <em /> }}
        />
      </div>
      <div className={classes.Grow} />
    </>
  );
};

const ShowingUp: React.FC<ScreenProps> = ({ data }) =>
  data.stats ? <ShowingUpView data={data} stats={data.stats} /> : null;

export default ShowingUp;
