import type { WrappedResponse } from "@pokenerdle/shared/wrapped";
import clsx from "clsx";
import posthog from "posthog-js";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import Background, {
  prefersReducedMotion,
  type BackgroundHandle,
} from "./Background";
import { buildScreens, SIMPLE_SCREENS, type ScreenId } from "./screens";
import classes from "./Wrapped.module.scss";

// Every screen reads what it needs from `data`. data.stats is set whenever a full-story
// screen renders.
export interface ScreenProps {
  data: WrappedResponse;
}

// A tap that starts on one of these never turns the page, so a screen's own controls
// (and its card) can take taps. Mark a non-interactive element with data-no-nav.
const NO_NAV_SELECTOR = "button, a, input, select, textarea, [data-no-nav]";

// A screen change, in milliseconds. The flood and the leaving content start together;
// the new content mounts partway through and the whole thing settles at TRANSITION_MS.
const ENTER_AT_MS = 220;
const TRANSITION_MS = 780;
const LEAVE_MS = 380;
const LEAVE_STAGGER_MS = 35;
const ENTER_MS = 500;
const FADE_MS = 200;

type Tone = "Red" | "Blue" | "Orange" | "Yellow" | "Purple" | "Green" | "Pink";

// Text colours follow the plate colour behind each screen.
const TONE: Record<ScreenId, Tone> = {
  opener: "Red",
  showingUp: "Blue",
  firstGuess: "Blue",
  streak: "Orange",
  signature: "Yellow",
  types: "Purple",
  clock: "Green",
  average: "Pink",
  thanks: "Red",
  card: "Yellow",
};

// How a screen arrives: sliding in from the side the story is travelling towards, or
// fading in when motion is reduced.
type Enter = { kind: "slide"; direction: 1 | -1 } | { kind: "fade" };

interface Content {
  main: number; // index of the screen on show
  leaving: number | null; // index of the screen on its way out
  enter: Enter | null; // how `main` arrives; null when it was there from the start
}

// Stands in for the real screens until Task 8.
const ScreenContent: React.FC<ScreenProps & { id: ScreenId }> = ({ id }) => {
  const { t } = useTranslation("wrapped");
  return (
    <>
      <div className={clsx(classes.Tag, classes.Pop)}>{t("tag")}</div>
      <div className={classes.Main}>
        <div className={clsx(classes.Title, classes.Slam)}>{id}</div>
      </div>
    </>
  );
};

interface ScreenViewProps {
  id: ScreenId;
  data: WrappedResponse;
  enter: Enter | null;
}

// One screen. Its direct children are the pieces that fly out when the screen leaves.
const ScreenView: React.FC<ScreenViewProps> = ({ id, data, enter }) => {
  const el = useRef<HTMLElement>(null);
  const enterOnMount = useRef(enter);

  // Before first paint, so the screen never shows in place for a frame before it moves.
  useLayoutEffect(() => {
    const how = enterOnMount.current;
    if (!el.current || !how) return;
    el.current.animate(
      how.kind === "fade"
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { transform: `translateX(${how.direction * el.current.clientWidth * 0.22}px)` },
            { transform: "none" },
          ],
      how.kind === "fade"
        ? { duration: FADE_MS }
        : { duration: ENTER_MS, easing: "cubic-bezier(.2,.9,.3,1)" },
    );
  }, []);

  return (
    <section
      ref={el}
      data-screen={id}
      className={clsx(classes.Screen, classes.StoryScreen, classes[TONE[id]])}
    >
      <ScreenContent id={id} data={data} />
    </section>
  );
};

const Story: React.FC<{ data: WrappedResponse }> = ({ data }) => {
  const screens = useMemo(
    () => (data.stats ? buildScreens(data.stats) : SIMPLE_SCREENS),
    [data.stats],
  );
  const [index, setIndex] = useState(0); // drives the progress segments
  const [content, setContent] = useState<Content>({
    main: 0,
    leaving: null,
    enter: null,
  });
  const indexRef = useRef(0);
  const busy = useRef(false); // true while a screen change plays; input is ignored
  const timers = useRef<number[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const background = useRef<BackgroundHandle>(null);
  const pressStartedOnControl = useRef(false);
  const hasCapturedFinal = useRef(false);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  // Moves to screen `to`; (x, y) is where the background flood starts, in stage pixels.
  const go = useCallback(
    (to: number, x: number, y: number) => {
      const root = stage.current;
      const from = indexRef.current;
      if (!root || busy.current || to < 0 || to >= screens.length || to === from) {
        return;
      }
      busy.current = true;
      indexRef.current = to;
      setIndex(to);
      background.current?.flood(screens[from], screens[to], x, y);

      const leaving = root.querySelector<HTMLElement>(
        `[data-screen="${screens[from]}"]`,
      );
      const finish = () => {
        setContent({ main: to, leaving: null, enter: null });
        busy.current = false;
      };

      if (prefersReducedMotion()) {
        leaving?.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: FADE_MS,
          fill: "forwards",
        });
        setContent({ main: to, leaving: from, enter: { kind: "fade" } });
        later(finish, FADE_MS);
        return;
      }

      // Old content leaves in the direction of travel, one piece after another.
      const direction = to > from ? 1 : -1;
      const width = root.clientWidth;
      [...(leaving?.children ?? [])]
        .filter((piece) => !piece.classList.contains(classes.Grow))
        .forEach((piece, n) => {
          piece.animate(
            [
              { transform: "none", opacity: 1 },
              {
                transform: `translateX(${-direction * width * 1.1}px) rotate(${-direction * 14}deg)`,
                opacity: 0,
              },
            ],
            {
              duration: LEAVE_MS,
              delay: n * LEAVE_STAGGER_MS,
              easing: "cubic-bezier(.5,0,.9,.4)",
              fill: "forwards",
            },
          );
        });
      // The new screen arrives from the other side once the old one is mostly gone.
      later(
        () =>
          setContent({
            main: to,
            leaving: from,
            enter: { kind: "slide", direction },
          }),
        ENTER_AT_MS,
      );
      later(finish, TRANSITION_MS);
    },
    [screens, later],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const root = stage.current;
      if (!root || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      // Space belongs to a focused button or link, which it activates.
      const onControl =
        e.target instanceof Element && e.target.closest(NO_NAV_SELECTOR);
      const current = indexRef.current;
      if (e.key === "ArrowRight" || (e.key === " " && !onControl)) {
        e.preventDefault();
        go(current + 1, root.clientWidth, root.clientHeight / 2);
      } else if (e.key === "ArrowLeft") {
        go(current - 1, 0, root.clientHeight / 2);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [go]);

  useEffect(() => {
    if (screens[content.main] !== "card" || hasCapturedFinal.current) return;
    hasCapturedFinal.current = true;
    posthog.capture("wrapped_final_screen_reached");
  }, [content.main, screens]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const startedOnControl = pressStartedOnControl.current;
    pressStartedOnControl.current = false;
    if (startedOnControl || (e.target as Element).closest(NO_NAV_SELECTOR)) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    go(indexRef.current + (x < box.width / 3 ? -1 : 1), x, y);
  };

  // Rendered oldest first so the arriving screen sits on top of the leaving one.
  const visible = [content.leaving, content.main].filter(
    (n): n is number => n !== null,
  );

  return (
    // The stage is a pointer target only; keyboard users get the arrow keys and space.
    <div
      ref={stage}
      className={clsx(classes.Stage, classes.Tappable)}
      onPointerDownCapture={(e) => {
        pressStartedOnControl.current = !!(e.target as Element).closest(
          NO_NAV_SELECTOR,
        );
      }}
      onClick={onClick}
    >
      <Background ref={background} screens={screens} initial={screens[0]} />
      <div className={classes.Bars} aria-hidden="true">
        {screens.map((id, n) => (
          <i key={id} className={clsx(n <= index && classes.BarOn)} />
        ))}
      </div>
      {visible.map((n) => (
        <ScreenView
          key={screens[n]}
          id={screens[n]}
          data={data}
          enter={n === content.main ? content.enter : null}
        />
      ))}
    </div>
  );
};

export default Story;
