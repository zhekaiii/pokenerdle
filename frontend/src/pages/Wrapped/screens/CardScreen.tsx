import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import Card from "../Card";
import cardClasses from "../Card.module.scss";
import { delay } from "../style";
import type { ScreenProps } from "../Story";
import classes from "../Wrapped.module.scss";

// The last screen. The card and the buttons take their own taps (data-no-nav), so
// touching them never turns the page.
const CardScreen: React.FC<ScreenProps> = ({ data }) => {
  const { t } = useTranslation("wrapped");
  return (
    <>
      <div className={clsx(classes.Tag, cardClasses.Headline, classes.Pop)}>
        {t("card.headline")}
      </div>
      <div className={cardClasses.Drop}>
        <Card data={data} interactive />
      </div>
      <div className={clsx(cardClasses.Url, classes.Up)} style={delay(1.2)}>
        POKENERDLE.APP
      </div>
      <div className={classes.Grow} />
      {/* Saving and sharing are wired up later; until then the buttons only sit here. */}
      <div className={clsx(cardClasses.Buttons, classes.Up)} style={delay(1.5)} data-no-nav>
        <button type="button" disabled>
          {t("card.save")}
        </button>
        <button type="button" className={cardClasses.Primary} disabled>
          {t("card.share")}
        </button>
      </div>
    </>
  );
};

export default CardScreen;
