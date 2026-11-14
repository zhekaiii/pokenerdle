import api from "@/api";
import "@fontsource/anton/400.css";
import "@fontsource/rubik/500.css";
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/900.css";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import posthog from "posthog-js";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Plate } from "./Background";
import { getDemoResponse } from "./demoData";
import { buildScreens, SIMPLE_SCREENS, type ScreenId } from "./screens";
import Story from "./Story";
import { delay } from "./style";
import classes from "./Wrapped.module.scss";

export const WRAPPED_QUERY_KEY = "wrapped";

type Tone = "Red" | "Blue" | "Yellow" | "Purple" | "Green";

// A poster screen uses the plate of the story screen with the same colour.
const TONE_PLATE: Record<Tone, ScreenId> = {
  Red: "opener",
  Blue: "showingUp",
  Yellow: "signature",
  Purple: "types",
  Green: "clock",
};

// The Chinese lettering fonts are large, so only players reading Chinese download them.
// Weight 900 only: the poster lettering is always the heaviest weight.
const loadChineseFont = (language: string) => {
  if (language === "zh-Hans") return import("@fontsource/noto-sans-sc/900.css");
  if (language === "zh-Hant") return import("@fontsource/noto-sans-tc/900.css");
};

const useChineseFont = (language: string) => {
  useEffect(() => {
    loadChineseFont(language)?.catch(() => {
      // The stack falls back to the system font, so a failed download is not fatal.
    });
  }, [language]);
};

interface PosterProps {
  tone: Tone;
  children: React.ReactNode;
  busy?: boolean;
}

// One poster-style screen: a colour plate with a moving pattern, the tag and the content.
const Poster: React.FC<PosterProps> = ({ tone, children, busy }) => {
  const { t } = useTranslation("wrapped");
  return (
    <div className={clsx(classes.Stage, classes[tone])}>
      <div className={classes.Bg}>
        <Plate id={TONE_PLATE[tone]} />
      </div>
      <section className={classes.Screen} aria-busy={busy}>
        <div className={classes.Tag}>{t("tag")}</div>
        <div className={classes.Main}>{children}</div>
      </section>
    </div>
  );
};

const LoadingScreen: React.FC = () => {
  const { t } = useTranslation("wrapped");
  return (
    <Poster tone="Red" busy>
      <div className={clsx(classes.Title, classes.Slam)}>
        {t("loading.title")}
      </div>
      <div className={clsx(classes.Sticker, classes.Pop)} style={delay(".4s")}>
        {t("loading.sticker")}
      </div>
    </Poster>
  );
};

const ErrorScreen: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const { t } = useTranslation("wrapped");
  return (
    <Poster tone="Blue">
      <div className={clsx(classes.Title, classes.Slam)}>
        {t("error.title")}
      </div>
      <div className={clsx(classes.Sticker, classes.Pop)} style={delay(".4s")}>
        {t("error.sticker")}
      </div>
      <div className={clsx(classes.Body, classes.Up)} style={delay(".7s")}>
        {t("error.body")}
      </div>
      <button type="button" className={classes.Button} onClick={onRetry}>
        {t("error.retry")}
      </button>
    </Poster>
  );
};

const BeforeScreen: React.FC = () => {
  const { t } = useTranslation("wrapped");
  return (
    <Poster tone="Yellow">
      <div className={clsx(classes.Title, classes.Slam)}>
        {t("before.title")}
      </div>
      <div className={clsx(classes.When, classes.Slam)} style={delay(".25s")}>
        {t("before.when")}
      </div>
      <div className={clsx(classes.Sticker, classes.Pop)} style={delay(".7s")}>
        {t("before.sticker")}
      </div>
      <div className={clsx(classes.Body, classes.Up)} style={delay(".95s")}>
        {t("before.body")}
      </div>
    </Poster>
  );
};

const ClosedScreen: React.FC = () => {
  const { t } = useTranslation("wrapped");
  return (
    <Poster tone="Purple">
      <div className={clsx(classes.Title, classes.Slam)}>
        {t("closed.title")}
      </div>
      <div className={clsx(classes.Sticker, classes.Pop)} style={delay(".5s")}>
        {t("closed.sticker")}
      </div>
      <div className={clsx(classes.Body, classes.Up)} style={delay(".8s")}>
        {t("closed.body")}
      </div>
      <Link to="/daily" className={classes.Button}>
        {t("closed.cta")}
      </Link>
    </Poster>
  );
};

// Nobody has guessed a daily, so there is nothing to recap: invite them to play.
const EmptyScreen: React.FC = () => {
  const { t } = useTranslation("wrapped");
  return (
    <Poster tone="Green">
      <div className={clsx(classes.Title, classes.Slam)}>
        {t("empty.title")}
      </div>
      <div className={clsx(classes.Sticker, classes.Pop)} style={delay(".5s")}>
        {t("empty.sticker")}
      </div>
      <div className={clsx(classes.Body, classes.Up)} style={delay(".8s")}>
        {t("empty.body")}
      </div>
      <Link to="/daily" className={classes.Button}>
        {t("empty.cta")}
      </Link>
    </Poster>
  );
};

const WrappedPage: React.FC = () => {
  // "types" holds the type names the types screen shows. Loading it here, with the page,
  // keeps it from suspending in the middle of a screen change.
  const { i18n } = useTranslation(["wrapped", "types"]);
  useChineseFont(i18n.language);

  // Development only: ?demo=1 or ?demo=simple shows the story with made-up numbers.
  // The branch is dead in production builds, so none of this ships.
  const search = useLocation({ select: (location) => location.searchStr });
  const demo = import.meta.env.DEV ? getDemoResponse(search) : null;

  const query = useQuery({
    queryKey: [WRAPPED_QUERY_KEY],
    queryFn: api.daily.getWrapped,
    staleTime: Infinity,
    retry: 1,
    enabled: !demo,
  });
  const { isError, isFetching, refetch } = query;
  const data = demo ?? query.data;

  const hasCapturedOpen = useRef(false);
  useEffect(() => {
    if (!query.data || hasCapturedOpen.current) return;
    hasCapturedOpen.current = true;
    posthog.capture("wrapped_opened", {
      phase: query.data.phase,
      eligible: query.data.eligible,
    });
  }, [query.data]);

  let screen: React.ReactNode;
  if (!data) {
    screen =
      isError && !isFetching ? (
        <ErrorScreen onRetry={() => refetch()} />
      ) : (
        <LoadingScreen />
      );
  } else if (data.phase === "before") {
    screen = <BeforeScreen />;
  } else if (data.phase === "closed") {
    screen = <ClosedScreen />;
  } else if (data.eligible || data.simple) {
    // Story keeps an index into its screen list, so a different list needs a fresh Story.
    const screens = data.stats ? buildScreens(data.stats) : SIMPLE_SCREENS;
    screen = <Story key={screens.join()} data={data} />;
  } else {
    screen = <EmptyScreen />;
  }

  return <div className={classes.Backdrop}>{screen}</div>;
};

export default WrappedPage;
