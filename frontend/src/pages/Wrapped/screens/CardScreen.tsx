import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import type { WrappedFinish } from "@pokenerdle/shared/wrapped";
import posthog from "posthog-js";
import React, {
  useEffect,
  useMemo,
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

// Drawing the image takes the main thread for a moment. Start once the screen has slid
// in, so the change of screen stays smooth.
const RENDER_DELAY_MS = TRANSITION.busyMs;

// Up to four images of about a megabyte each, one per finish the player may pick.
type ShareImages = Partial<Record<WrappedFinish, ShareImageState>>;

// Draws a share image for every finish in `finishes`, from its node in `nodes`, and keeps
// them, so a tap on Share can open the share sheet at once (browsers refuse a share that
// comes too long after the tap) and switching finish needs no new drawing. They are drawn
// one at a time once the screen has settled, the one on show first: a finish the player
// picks before its image exists is drawn next.
const useShareImages = (
  nodes: React.RefObject<Partial<Record<WrappedFinish, HTMLElement>>>,
  finishes: WrappedFinish[],
  finish: WrappedFinish,
) => {
  const [attempt, setAttempt] = useState(0);
  const [images, setImages] = useState<ShareImages>({});
  // Read by the drawing loop between images, so it follows the player's picks.
  const wanted = useRef(finish);
  const drawn = useRef<ShareImages>({});
  useEffect(() => {
    wanted.current = finish;
  }, [finish]);
  useEffect(() => {
    drawn.current = images;
  }, [images]);

  useEffect(() => {
    let current = true;
    // Finishes this round has drawn or tried. A retry redraws only the failed ones.
    const done = new Set(finishes.filter((f) => drawn.current[f]?.status === "ready"));
    const next = () =>
      done.has(wanted.current) ? finishes.find((f) => !done.has(f)) : wanted.current;
    const draw = async () => {
      for (let name = next(); name && current; name = next()) {
        done.add(name);
        const node = nodes.current[name];
        if (!node) continue;
        let result: ShareImageState;
        try {
          result = { status: "ready", blob: await renderShareImage(node) };
        } catch (error) {
          console.error("Wrapped share image failed", error);
          result = { status: "failed" };
        }
        if (current) setImages((all) => ({ ...all, [name]: result }));
      }
    };
    const timer = window.setTimeout(
      () => void draw(),
      attempt === 0 ? RENDER_DELAY_MS : 0,
    );
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [nodes, finishes, attempt]);

  const retry = () => {
    setImages((all) =>
      Object.fromEntries(
        Object.entries(all).filter(([, image]) => image.status === "ready"),
      ),
    );
    setAttempt((n) => n + 1);
  };
  const state: ShareImageState = images[finish] ?? { status: "rendering" };
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
  const finishes = useMemo(() => finishesUpTo(earned), [earned]);
  const [finish, setFinish] = useState<WrappedFinish>(earned);
  const shareNodes = useRef<Partial<Record<WrappedFinish, HTMLElement>>>({});
  const { state, retry } = useShareImages(shareNodes, finishes, finish);
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
        {t("card.headline")}
      </div>
      <div className={cardClasses.Drop}>
        <Card data={data} interactive finish={finish} />
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
      {/* The pictures people save and share: this screen again, at 1080 × 1920 and
          without the buttons, once per finish, kept off-screen. Each is drawn from its
          inner element. */}
      <div className={classes.ShareHost} aria-hidden="true">
        {finishes.map((name) => (
          <div
            key={name}
            ref={(el) => {
              if (el) shareNodes.current[name] = el;
              else delete shareNodes.current[name];
            }}
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
                <Card data={data} interactive={false} finish={name} />
              </div>
              <div className={cardClasses.Url}>POKENERDLE.APP</div>
            </section>
          </div>
        ))}
      </div>
    </>
  );
};

export default CardScreen;
