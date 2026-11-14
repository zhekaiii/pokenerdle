import { WRAPPED_YEAR } from "@pokenerdle/shared/wrapped";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { delay } from "../style";
import type { ScreenProps } from "../Story";
import classes from "../Wrapped.module.scss";

const Opener: React.FC<ScreenProps> = ({ data }) => {
  const { t } = useTranslation("wrapped");
  return (
    <>
      <div className={clsx(classes.Tag, classes.Pop)}>{t("tag")}</div>
      <div className={classes.Grow} />
      <div
        className={clsx(classes.Title, classes.OpenerTitle, classes.Slam)}
        style={delay(".15s")}
      >
        {t("opener.your")}
      </div>
      <div
        className={clsx(classes.Huge, classes.OpenerYear, classes.Slam)}
        style={delay(".35s")}
      >
        {WRAPPED_YEAR}
      </div>
      <div
        className={clsx(classes.Title, classes.OpenerSub, classes.Slam)}
        style={delay(".55s")}
      >
        {t("opener.in")}
      </div>
      <div className={classes.Grow} />
      {/* A December newcomer has nothing in the January to November window. */}
      {data.daysPlayed > 0 && (
        <div
          className={clsx(classes.Sticker, classes.StickerSmall, classes.Pop)}
          style={delay(".9s")}
        >
          {t("opener.period")}
        </div>
      )}
      <div className={classes.Grow} />
      <div className={classes.Go}>{t("opener.go")}</div>
    </>
  );
};

export default Opener;
