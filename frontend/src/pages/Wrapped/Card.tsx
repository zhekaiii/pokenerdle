import questionMarkIcon from "@/assets/question_mark.png";
import {
  WRAPPED_WINDOW_DAYS,
  WRAPPED_YEAR,
  type WrappedFinish,
  type WrappedResponse,
} from "@pokenerdle/shared/wrapped";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { readArtworkFit } from "./cardArt";
import { typeColorVars } from "./cardColors";
import classes from "./Card.module.scss";
import { formatDay, pokemonInfo } from "./format";
import { composeRainbowArtwork } from "./rainbowArt";
import { pickCardRows, type CardRow } from "./screens";
import Artwork from "./screens/Artwork";
import { cssVars } from "./style";
import { useCardTilt } from "./useCardTilt";
import { useFitText } from "./useFitText";

const FINISH_CLASS: Record<WrappedFinish, string | undefined> = {
  standard: undefined,
  foil: classes.Foil,
  gold: classes.Gold,
  rainbow: classes.Rainbow,
};

const STARS: Record<WrappedFinish, string> = {
  standard: "",
  foil: "★",
  gold: "★★",
  rainbow: "★★★",
};

// Standard and foil take the top type's colours. Gold and rainbow are the rare finishes:
// a frame of their own, a seal with the average, and artwork scaled and shaded to suit it.
const isRare = (finish: WrappedFinish) => finish === "gold" || finish === "rainbow";
const hasTypeColours = (finish: WrappedFinish) => !isRare(finish);

// Everything the card shows, worked out from the response. A full card and the rookie
// card differ only in this.
interface CardFace {
  finish: WrappedFinish;
  name: string;
  artwork: string | null;
  topType: string | undefined;
  tagline: string;
  corner: React.ReactNode;
  strip: string;
  rows: { label: string; value: string }[];
  footer: string;
  seal: string | null; // the average, on gold and rainbow
}

const useCardFace = (data: WrappedResponse): CardFace | null => {
  const { t, i18n } = useTranslation(["wrapped", "types"]);
  const { stats, simple } = data;

  const rowText = (row: CardRow) => {
    switch (row.kind) {
      case "streak":
        return {
          label: t("card.streak"),
          value: t("card.valueDays", { count: row.days }),
        };
      case "type":
        return { label: t("card.type"), value: t(row.type, { ns: "types" }) };
      case "average":
        return {
          label: t("card.average"),
          value: t("card.valueGuesses", { value: row.value.toFixed(1) }),
        };
      case "unique":
        return { label: t("card.unique"), value: String(row.count) };
      case "solved":
        return {
          label: t("card.solved"),
          value: t("card.valueDays", { count: row.days }),
        };
    }
  };

  if (stats) {
    const mon = pokemonInfo(data, stats.opener.pokemonId, i18n.language);
    return {
      finish: stats.finish,
      name: mon.name,
      artwork: mon.artwork,
      topType: stats.topTypes[0]?.type,
      tagline: t("card.signatureOpener"),
      corner: (
        <>
          <b>{stats.daysPlayed}</b> {t("card.days", { count: stats.daysPlayed })}
        </>
      ),
      strip: t("signature.days", { count: stats.opener.days }),
      rows: pickCardRows(stats).map(rowText),
      footer: `${stats.daysPlayed}/${WRAPPED_WINDOW_DAYS}`,
      seal:
        isRare(stats.finish) && stats.average !== null
          ? stats.average.toFixed(1)
          : null,
    };
  }

  if (simple) {
    const mon = pokemonInfo(data, simple.pokemonId, i18n.language);
    return {
      finish: "standard",
      name: mon.name,
      artwork: mon.artwork,
      topType: data.pokemon[simple.pokemonId]?.types[0],
      tagline: t("card.firstGuess"),
      corner: <b>{t("card.new")}</b>,
      strip: t("card.rookieStrip"),
      rows: [
        { label: t("card.joined"), value: formatDay(i18n.language, simple.date, true) },
        { label: t("card.status"), value: t("card.rookie") },
      ],
      footer: t("card.rookieCard"),
      seal: null,
    };
  }

  return null;
};

interface CardProps {
  data: WrappedResponse;
  // False renders a still: no tilt, no shimmer animation, no landing wobble. The share
  // image is made from a still.
  interactive: boolean;
}

// The collectible card. Renders from data.stats, or the rookie card from data.simple when
// there are no stats. Sized by its container: it fills the width it is given.
const CardView: React.FC<{ face: CardFace; interactive: boolean }> = ({
  face,
  interactive,
}) => {
  const { t } = useTranslation("wrapped");
  const nameRef = useFitText<HTMLDivElement>(face.name);
  const { ref, handlers } = useCardTilt<HTMLDivElement>(interactive, {
    live: classes.Live,
    touched: classes.Touched,
  });
  const artRef = useRef<HTMLDivElement>(null);
  const { finish } = face;

  // Gold and rainbow scale the artwork, and rainbow corrects its shading, by what the
  // artwork turns out to be. The result goes straight onto the card as CSS variables.
  // Until it loads, or if its pixels cannot be read, the card keeps the defaults.
  useEffect(() => {
    const img = artRef.current?.querySelector("img");
    const card = ref.current;
    if (!img || !card || !isRare(finish)) return;
    let current = true;
    const adapt = async () => {
      // A failed artwork swaps itself for the placeholder, which is a load of its own.
      if (!img.complete || img.naturalWidth === 0) return;
      const fit = await readArtworkFit(img.currentSrc);
      if (!current) return;
      card.style.setProperty("--art-scale", String(fit.scale));
      card.style.setProperty("--art-brightness", String(fit.brightness));
    };
    void adapt(); // already loaded: cached, or loaded before hydration
    img.addEventListener("load", adapt);
    return () => {
      current = false;
      img.removeEventListener("load", adapt);
    };
  }, [face.artwork, finish, ref]);

  // The still rainbow card has no CSS mask or blend (html-to-image cannot draw them), so
  // its Pokémon is composed on a canvas once the artwork has loaded, and shown as a plain
  // picture. undefined until then, a data URL once it is made, null if it cannot be (the
  // card then shows the plain artwork).
  const bakesArt = !interactive && finish === "rainbow";
  const [bakedArt, setBakedArt] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    const img = artRef.current?.querySelector("img");
    const card = ref.current;
    if (!img || !card || !bakesArt) return;
    let current = true;
    const bake = async () => {
      // A failed artwork swaps itself for the placeholder, which is a load of its own.
      if (!img.complete || img.naturalWidth === 0) return;
      const made = await composeRainbowArtwork(
        img.currentSrc,
        img.offsetWidth,
        img.offsetHeight,
        card.clientWidth,
        (await readArtworkFit(img.currentSrc)).brightness,
      );
      if (current) setBakedArt(made);
    };
    void bake();
    img.addEventListener("load", bake);
    return () => {
      current = false;
      img.removeEventListener("load", bake);
    };
  }, [face.artwork, bakesArt, ref]);

  return (
    <div
      ref={ref}
      data-no-nav
      // The share image waits for this to go before it draws the card.
      data-art-pending={bakesArt && bakedArt === undefined ? "" : undefined}
      className={clsx(
        classes.Tilt,
        interactive ? classes.Interactive : classes.Flat,
      )}
      style={
        hasTypeColours(finish) ? typeColorVars(face.topType) : undefined
      }
      {...handlers}
      // The card takes its own touches and taps: they never turn the story's page.
      onPointerDown={(e) => {
        e.stopPropagation();
        handlers.onPointerDown(e);
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={interactive ? (e) => e.preventDefault() : undefined}
    >
      <div className={clsx(classes.Card, FINISH_CLASS[finish])}>
        <div className={classes.In}>
          <div className={classes.Tagline}>{face.tagline}</div>
          <div className={classes.Bar}>
            <div ref={nameRef} className={classes.Name}>
              {face.name}
            </div>
            <div className={classes.Corner}>{face.corner}</div>
          </div>
          <div
            ref={artRef}
            className={classes.Art}
            style={cssVars({ "--art-mask": `url("${face.artwork ?? questionMarkIcon}")` })}
          >
            <Artwork
              src={face.artwork}
              alt={face.name}
              crossOrigin="anonymous"
              className={bakedArt ? classes.Replaced : undefined}
            />
            {bakedArt && <img src={bakedArt} alt="" draggable={false} />}
            {face.seal && (
              <div className={classes.Seal}>
                <span>{face.seal}</span>
                <span>{t("card.avg")}</span>
              </div>
            )}
          </div>
          <div className={classes.Strip}>{face.strip}</div>
          {face.rows.map((row) => (
            <div key={row.label} className={classes.Row}>
              <span>{row.label}</span>
              <b>{row.value}</b>
            </div>
          ))}
          <div className={classes.Foot}>
            <span>
              {WRAPPED_YEAR}
              <i>{STARS[finish]}</i>
            </span>
            <span>{face.footer}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<CardProps> = ({ data, interactive }) => {
  const face = useCardFace(data);
  return face ? <CardView face={face} interactive={interactive} /> : null;
};

export default Card;
