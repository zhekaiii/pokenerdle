import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { delay } from "../style";
import type { ScreenProps } from "../Story";
import classes from "../Wrapped.module.scss";

const Thanks: React.FC<ScreenProps> = () => {
  const { t } = useTranslation("wrapped");
  return (
    <>
      <div className={clsx(classes.Tag, classes.Pop)}>{t("thanks.tag")}</div>
      <div className={classes.Grow} />
      <div
        className={clsx(classes.Title, classes.ThanksTitle, classes.Slam)}
        style={delay(0.15)}
      >
        {t("thanks.thanksFor")}
      </div>
      <div
        className={clsx(classes.Title, classes.ThanksTitle, classes.ThanksBig, classes.Slam)}
        style={delay(0.35)}
      >
        {t("thanks.playing")}
      </div>
      <div
        className={clsx(classes.Sticker, classes.StickerSmall, classes.Pop)}
        style={delay(0.9)}
      >
        {t("thanks.seeYou")}
      </div>
      <div className={classes.Grow} />
      <div className={classes.Grow} />
      <div className={classes.Go}>{t("thanks.go")}</div>
    </>
  );
};

export default Thanks;
