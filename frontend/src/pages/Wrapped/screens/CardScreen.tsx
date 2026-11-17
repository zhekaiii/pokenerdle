import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { WRAPPED_YEAR, type WrappedFinish } from "@pokenerdle/shared/wrapped";
import posthog from "posthog-js";
import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useTranslation } from "react-i18next";
import { Plate } from "../Background";
import Card from "../Card";
import cardClasses from "../Card.module.scss";
import { typeColorVars } from "../cardColors";
import {
  canShareFiles,
  renderShareImage,
  saveImage,
  shareImage,
} from "../shareImage";
import { finishesUpTo } from "../screens";
import { delay } from "../style";
import type { ScreenProps } from "../Story";
import { TRANSITION } from "../transition";
import classes from "../Wrapped.module.scss";

type ShareImageState =
  | { status: "rendering" }
  | { status: "ready"; blob: Blob }
  | { status: "failed" };

// The address printed under the card.
const SITE_ADDRESS = "POKENERDLE.APP";

// Drawing the image takes the main thread for a moment. Start once the screen has slid
// in, so the change of screen stays smooth.
const RENDER_DELAY_MS = TRANSITION.busyMs;

// The images drawn so far, one per finish the player has shown, about a megabyte each.
type ShareImages = Partial<Record<WrappedFinish, ShareImageState>>;

// Draws the share image for the finish on show, from `node`, and keeps it, so a tap on
// Share can open the share sheet at once (browsers refuse a share that comes too long
// after the tap). Only the finish on show is drawn: picking one not drawn yet draws it
// then, and picking one already drawn reuses its image. The first drawing waits for the
// screen to settle.
const useShareImage = (
  node: React.RefObject<HTMLElement | null>,
  finish: WrappedFinish,
) => {
  const [images, setImages] = useState<ShareImages>({});
  const hasStarted = useRef(false);
  const known = images[finish];

  useEffect(() => {
    if (known) return; // drawn, or failed and waiting for a retry
    let current = true;
    const draw = async () => {
      hasStarted.current = true;
      const el = node.current;
      if (!el) return;
      let result: ShareImageState;
      try {
        result = { status: "ready", blob: await renderShareImage(el) };
      } catch (error) {
        console.error("Wrapped share image failed", error);
        result = { status: "failed" };
      }
      if (current) setImages((all) => ({ ...all, [finish]: result }));
    };
    const timer = window.setTimeout(
      () => void draw(),
      hasStarted.current ? 0 : RENDER_DELAY_MS,
    );
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [node, finish, known]);

  const retry = () =>
    setImages((all) => {
      const rest = { ...all };
      delete rest[finish];
      return rest;
    });
  const state: ShareImageState = known ?? { status: "rendering" };
  return { state, retry };
};

// What a browser can share does not change while the page is open.
const subscribeNever = () => () => {};

// The last screen. The card and the buttons take their own taps (data-no-nav), so
// touching them never turns the page.
const CardScreen: React.FC<ScreenProps> = ({ data }) => {
  const { t } = useTranslation("wrapped");
  // The player may show any finish up to the one they earned, and starts on the best.
  const earned = data.stats?.finish ?? "standard";
  const finishes = finishesUpTo(earned);
  const [finish, setFinish] = useState<WrappedFinish>(earned);
  const shareNode = useRef<HTMLDivElement>(null);
  const { state, retry } = useShareImage(shareNode, finish);
  // False on the server and while hydrating, then what the browser says: the server
  // cannot know what the browser can share.
  const canShare = useSyncExternalStore(subscribeNever, canShareFiles, () => false);
  const [shareFailed, setShareFailed] = useState(false);
  // True while the share sheet is open: a second tap then does nothing, instead of asking
  // the browser to share again, which it refuses and which would show the failure notice.
  const sharing = useRef(false);

  const ready = state.status === "ready" ? state : null;

  const onSave = () => {
    if (!ready) return;
    saveImage(ready.blob);
    posthog.capture("wrapped_image_exported", { method: "save", finish, earned_finish: earned });
  };

  const onShare = async () => {
    if (!ready || sharing.current) return;
    sharing.current = true;
    setShareFailed(false);
    try {
      if ((await shareImage(ready.blob)) === "shared") {
        posthog.capture("wrapped_image_exported", {
          method: "share",
          finish,
          earned_finish: earned,
        });
      }
    } catch {
      setShareFailed(true);
    } finally {
      sharing.current = false;
    }
  };

  return (
    <>
      <div className={clsx(classes.Tag, cardClasses.Headline, classes.Pop)}>
        {t("card.headline", { year: WRAPPED_YEAR })}
      </div>
      <div className={cardClasses.Drop}>
        <Card data={data} interactive finish={finish} />
      </div>
      <div className={clsx(cardClasses.Url, classes.Up)} style={delay(1.2)}>
        {SITE_ADDRESS}
      </div>
      <div className={classes.Grow} />
      <div
        className={clsx(cardClasses.Actions, classes.Up)}
        style={delay(1.5)}
        data-no-nav
      >
        {state.status === "failed" ? (
          <>
            <p className={cardClasses.Notice} role="alert">
              {t("card.imageFailed")}
            </p>
            <div className={cardClasses.Buttons}>
              <button type="button" className={cardClasses.Primary} onClick={retry}>
                {t("card.retry")}
              </button>
            </div>
          </>
        ) : (
          <>
            {shareFailed && (
              <p className={cardClasses.Notice} role="alert">
                {t("card.shareFailed")}
              </p>
            )}
            <div className={cardClasses.Buttons} aria-busy={!ready}>
              <button type="button" disabled={!ready} onClick={onSave}>
                {ready ? t("card.save") : t("card.preparing")}
              </button>
              {canShare && (
                <button
                  type="button"
                  className={cardClasses.Primary}
                  disabled={!ready}
                  onClick={onShare}
                >
                  {ready ? t("card.share") : t("card.preparing")}
                </button>
              )}
            </div>
          </>
        )}
        {finishes.length > 1 && (
          <div
            className={cardClasses.Finish}
            role="group"
            aria-label={t("card.finish")}
            style={typeColorVars(data.stats?.topTypes[0]?.type)}
          >
            {finishes.map((name) => (
              <button
                key={name}
                type="button"
                data-finish={name}
                aria-pressed={name === finish}
                onClick={() => setFinish(name)}
              >
                {t(`card.finishes.${name}`)}
              </button>
            ))}
          </div>
        )}
        <Link to="/daily" className={classes.TextLink}>
          {t("card.playDaily")}
        </Link>
      </div>
      {/* The picture people save and share: this screen again, at 1080 × 1920 and
          without the buttons, in the finish on show, kept off-screen. It is drawn from
          its inner element. */}
      <div className={classes.ShareHost} aria-hidden="true">
        <div
          ref={shareNode}
          className={clsx(classes.ShareImage, classes.Still, classes.Yellow)}
        >
          <div className={classes.Bg}>
            <Plate id="card" />
          </div>
          <section className={clsx(classes.Screen, classes.ShareScreen)}>
            <div className={clsx(classes.Tag, cardClasses.Headline)}>
              {t("card.headline", { year: WRAPPED_YEAR })}
            </div>
            <div className={cardClasses.Drop}>
              <Card data={data} interactive={false} finish={finish} />
            </div>
            <div className={cardClasses.Url}>{SITE_ADDRESS}</div>
          </section>
        </div>
      </div>
    </>
  );
};

export default CardScreen;
