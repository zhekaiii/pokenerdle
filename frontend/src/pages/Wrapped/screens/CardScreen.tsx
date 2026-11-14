import clsx from "clsx";
import posthog from "posthog-js";
import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { Plate } from "../Background";
import Card from "../Card";
import cardClasses from "../Card.module.scss";
import {
  canShareFiles,
  renderShareImage,
  saveImage,
  shareImage,
} from "../shareImage";
import { delay } from "../style";
import type { ScreenProps } from "../Story";
import { TRANSITION } from "../transition";
import classes from "../Wrapped.module.scss";

type ShareImageState =
  | { status: "rendering" }
  | { status: "ready"; blob: Blob }
  | { status: "failed" };

// Drawing the image takes the main thread for a moment. Start once the screen has slid
// in, so the change of screen stays smooth.
const RENDER_DELAY_MS = TRANSITION.busyMs;

// Draws the share image from `node` as soon as the screen has settled, and keeps it, so
// a tap on Share can open the share sheet at once: browsers refuse a share that comes too
// long after the tap.
const useShareImage = (node: React.RefObject<HTMLElement | null>) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ShareImageState>({ status: "rendering" });

  useEffect(() => {
    let current = true;
    const timer = window.setTimeout(
      () => {
        if (!node.current) return;
        renderShareImage(node.current)
          .then((blob) => current && setState({ status: "ready", blob }))
          .catch((error: unknown) => {
            console.error("Wrapped share image failed", error);
            if (current) setState({ status: "failed" });
          });
      },
      attempt === 0 ? RENDER_DELAY_MS : 0,
    );
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [node, attempt]);

  const retry = () => {
    setState({ status: "rendering" });
    setAttempt((n) => n + 1);
  };
  return { state, retry };
};

// What a browser can share does not change while the page is open.
const subscribeNever = () => () => {};

// The last screen. The card and the buttons take their own taps (data-no-nav), so
// touching them never turns the page.
const CardScreen: React.FC<ScreenProps> = ({ data }) => {
  const { t } = useTranslation("wrapped");
  const finish = data.stats?.finish ?? "standard";
  const shareNode = useRef<HTMLDivElement>(null);
  const { state, retry } = useShareImage(shareNode);
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
    posthog.capture("wrapped_image_exported", { method: "save", finish });
  };

  const onShare = async () => {
    if (!ready || sharing.current) return;
    sharing.current = true;
    setShareFailed(false);
    try {
      if ((await shareImage(ready.blob)) === "shared") {
        posthog.capture("wrapped_image_exported", { method: "share", finish });
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
        {t("card.headline")}
      </div>
      <div className={cardClasses.Drop}>
        <Card data={data} interactive />
      </div>
      <div className={clsx(cardClasses.Url, classes.Up)} style={delay(1.2)}>
        POKENERDLE.APP
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
      </div>
      {/* The picture people save and share: this screen again, at 1080 × 1920 and
          without the buttons, kept off-screen. It is drawn from the inner element. */}
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
              {t("card.headline")}
            </div>
            <div className={cardClasses.Drop}>
              <Card data={data} interactive={false} />
            </div>
            <div className={cardClasses.Url}>POKENERDLE.APP</div>
          </section>
        </div>
      </div>
    </>
  );
};

export default CardScreen;
