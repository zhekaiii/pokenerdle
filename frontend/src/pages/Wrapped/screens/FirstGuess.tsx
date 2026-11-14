import { WRAPPED_YEAR } from "@pokenerdle/shared/wrapped";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { formatDay, pokemonInfo } from "../format";
import { delay } from "../style";
import type { ScreenProps } from "../Story";
import { useFitText } from "../useFitText";
import classes from "../Wrapped.module.scss";
import Artwork from "./Artwork";

// The simplified story's screen: a player with too few days for the full story meets
// their first-ever guess.
const FirstGuess: React.FC<ScreenProps> = ({ data }) => {
  const { t, i18n } = useTranslation("wrapped");
  const first = data.simple;
  const mon = first ? pokemonInfo(data, first.pokemonId, i18n.language) : null;
  const nameRef = useFitText<HTMLDivElement>(mon?.name ?? "");
  if (!first || !mon) return null;
  const date = formatDay(
    i18n.language,
    first.date,
    !first.date.startsWith(String(WRAPPED_YEAR)),
  );
  return (
    <>
      <div className={clsx(classes.Tag, classes.FirstGuessTag, classes.Pop)}>
        {t("firstGuess.tag")}
      </div>
      <div
        className={clsx(classes.Burst, classes.PosterBurst, classes.Pop)}
        style={delay(".2s")}
      >
        <Artwork src={mon.artwork} alt={mon.name} />
      </div>
      <div
        ref={nameRef}
        className={clsx(
          classes.Title,
          classes.FitName,
          classes.FirstGuessName,
          classes.Slam,
        )}
        style={delay(".7s")}
      >
        {mon.name}
      </div>
      <div
        className={clsx(
          classes.Body,
          classes.BodyCenter,
          classes.BodyLight,
          classes.AfterName,
          classes.Up,
        )}
        style={delay("1.1s")}
      >
        {t("firstGuess.line", { date })}
      </div>
      <div
        className={clsx(
          classes.Sticker,
          classes.StickerSmall,
          classes.AfterBody,
          classes.Pop,
        )}
        style={delay("1.4s")}
      >
        {t("firstGuess.welcome")}
      </div>
      {/* Players with 1 to 4 days before December also see how many they played. */}
      {data.daysPlayed >= 1 && (
        <div
          className={clsx(
            classes.Body,
            classes.BodyCenter,
            classes.BodyLight,
            classes.FirstGuessDays,
            classes.Up,
          )}
          style={delay("1.7s")}
        >
          {t("firstGuess.days", { count: data.daysPlayed })}
        </div>
      )}
      <div className={classes.Grow} />
    </>
  );
};

export default FirstGuess;
