import api from "@/api";
import type { WrappedResponse } from "@pokenerdle/shared/wrapped";
import "@fontsource/anton/400.css";
import "@fontsource/rubik/500.css";
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/900.css";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import posthog from "posthog-js";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import classes from "./Wrapped.module.scss";

export const WRAPPED_QUERY_KEY = "wrapped";

// Entrance animations read their start time from --d (see Wrapped.module.scss).
const delay = (seconds: string) => ({ "--d": seconds }) as React.CSSProperties;

type Tone = "Red" | "Blue" | "Yellow" | "Purple" | "Green" | "Pink";

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
        <div className={classes.Plate}>
          {tone === "Red" && (
            <>
              <i />
              <i />
              <i />
              <i />
            </>
          )}
        </div>
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

// Stands in for <Story data={data} /> until Task 7 builds it; delete this and the
// `placeholder` locale keys when it lands.
const StoryPlaceholder: React.FC<{ data: WrappedResponse }> = ({ data }) => {
  const { t } = useTranslation("wrapped");
  return (
    <Poster tone="Pink">
      <div className={clsx(classes.Title, classes.Slam)}>
        {data.eligible ? t("placeholder.full") : t("placeholder.simple")}
      </div>
      <div className={clsx(classes.Huge, classes.Slam)} style={delay(".25s")}>
        {data.daysPlayed}
      </div>
      <div className={clsx(classes.Sticker, classes.Pop)} style={delay(".7s")}>
        {t("placeholder.days")}
      </div>
    </Poster>
  );
};

const WrappedPage: React.FC = () => {
  const { i18n } = useTranslation("wrapped");
  useChineseFont(i18n.language);

  const { data, isError, isFetching, refetch } = useQuery({
    queryKey: [WRAPPED_QUERY_KEY],
    queryFn: api.daily.getWrapped,
    staleTime: Infinity,
    retry: 1,
  });

  const hasCapturedOpen = useRef(false);
  useEffect(() => {
    if (!data || hasCapturedOpen.current) return;
    hasCapturedOpen.current = true;
    posthog.capture("wrapped_opened", {
      phase: data.phase,
      eligible: data.eligible,
    });
  }, [data]);

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
    screen = <StoryPlaceholder data={data} />;
  } else {
    screen = <EmptyScreen />;
  }

  return <div className={classes.Backdrop}>{screen}</div>;
};

export default WrappedPage;
