import type { WrappedStats } from "@pokenerdle/shared/wrapped";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { cssVars, delay } from "../style";
import type { ScreenProps } from "../Story";
import { useFitText } from "../useFitText";
import classes from "../Wrapped.module.scss";

const MAX_BARS = 3;
// One colour per rank, top type first.
const BAR_COLOURS = ["#ffde00", "#3d8bff", "#c9d1dc"];

const toPercent = (share: number) => Math.round(share * 100);

const TypesView: React.FC<{ topTypes: WrappedStats["topTypes"] }> = ({
  topTypes,
}) => {
  const { t } = useTranslation(["wrapped", "types"]);
  const typeName = (type: string) => t(type, { ns: "types" });
  const top = topTypes[0];
  const topName = top ? typeName(top.type) : "";
  const nameRef = useFitText<HTMLDivElement>(topName);
  if (!top) return null;
  return (
    <>
      <div className={clsx(classes.Tag, classes.Pop)}>{t("types.tag")}</div>
      <div
        ref={nameRef}
        className={clsx(classes.Title, classes.TopType, classes.Slam)}
        style={delay(0.2)}
      >
        {topName}
      </div>
      <div
        className={clsx(classes.Huge, classes.TypePercent, classes.Slam)}
        style={delay(0.6)}
      >
        {toPercent(top.share)}%
      </div>
      <div
        className={clsx(classes.Body, classes.BodyCenter, classes.BodyLight, classes.Up)}
        style={delay(1)}
      >
        {t("types.body", { type: topName })}
      </div>
      <div className={classes.TypeBars}>
        {topTypes.slice(0, MAX_BARS).map(({ type, share }, rank) => (
          <div
            key={type}
            className={clsx(classes.Bar, classes.Up)}
            style={delay(1.3 + rank * 0.15)}
          >
            <span>{typeName(type)}</span>
            <div>
              <b
                style={cssVars({
                  "--w": `${(share / top.share) * 100}%`,
                  "--c": BAR_COLOURS[rank],
                  "--d": `${(1.4 + rank * 0.15).toFixed(2)}s`,
                })}
              />
            </div>
            <em>{toPercent(share)}%</em>
          </div>
        ))}
      </div>
      <div className={classes.Grow} />
    </>
  );
};

const Types: React.FC<ScreenProps> = ({ data }) =>
  data.stats ? <TypesView topTypes={data.stats.topTypes} /> : null;

export default Types;
