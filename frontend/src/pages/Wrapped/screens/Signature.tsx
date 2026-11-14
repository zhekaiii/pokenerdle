import type { WrappedResponse, WrappedStats } from "@pokenerdle/shared/wrapped";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { pokemonInfo } from "../format";
import { delay } from "../style";
import type { ScreenProps } from "../Story";
import { useFitText } from "../useFitText";
import classes from "../Wrapped.module.scss";
import Artwork from "./Artwork";

const SignatureView: React.FC<{ data: WrappedResponse; stats: WrappedStats }> = ({
  data,
  stats,
}) => {
  const { t, i18n } = useTranslation("wrapped");
  const mon = pokemonInfo(data, stats.opener.pokemonId, i18n.language);
  const nameRef = useFitText<HTMLDivElement>(mon.name);
  return (
    <>
      <div className={clsx(classes.Tag, classes.Pop)}>{t("signature.tag")}</div>
      <div
        className={clsx(classes.Burst, classes.PosterBurst, classes.Pop)}
        style={delay(0.2)}
      >
        <Artwork src={mon.artwork} alt={mon.name} />
      </div>
      <div
        ref={nameRef}
        className={clsx(classes.Title, classes.FitName, classes.Slam)}
        style={delay(0.7)}
      >
        {mon.name}
      </div>
      <div
        className={clsx(classes.Body, classes.BodyCenter, classes.AfterName, classes.Up)}
        style={delay(1.1)}
      >
        {t("signature.body", { name: mon.name })}
      </div>
      <div
        className={clsx(
          classes.Sticker,
          classes.StickerSmall,
          classes.AfterBody,
          classes.Pop,
        )}
        style={delay(1.4)}
      >
        {t("signature.days", { count: stats.opener.days })}
      </div>
      <div className={classes.Grow} />
    </>
  );
};

const Signature: React.FC<ScreenProps> = ({ data }) =>
  data.stats ? <SignatureView data={data} stats={data.stats} /> : null;

export default Signature;
