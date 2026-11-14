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
        style={delay(".15s")}
      >
        {t("thanks.thanksFor")}
      </div>
      <div
        className={clsx(classes.Title, classes.ThanksTitle, classes.ThanksBig, classes.Slam)}
        style={delay(".35s")}
      >
        {t("thanks.playing")}
      </div>
      <div
        className={clsx(classes.Sticker, classes.StickerSmall, classes.Pop)}
        style={delay(".9s")}
      >
        {t("thanks.seeYou")}
      </div>
      <div className={classes.Grow} />
      <div
        className={clsx(classes.Body, classes.BodyCenter, classes.BodyLight, classes.Up)}
        style={delay("1.2s")}
      >
        {t("thanks.body")}
      </div>
      <div className={classes.Grow} />
      <div className={classes.Go}>{t("thanks.go")}</div>
    </>
  );
};

export default Thanks;
