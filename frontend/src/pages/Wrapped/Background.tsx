import clsx from "clsx";
import React, { useEffect, useImperativeHandle, useRef } from "react";
import type { ScreenId } from "./screens";
import { TRANSITION } from "./transition";
import classes from "./Wrapped.module.scss";

export interface BackgroundHandle {
  // Reveals `to` over `from` in a circle growing from (x, y), in stage pixels. With
  // reduced motion it cross-fades instead.
  flood(from: ScreenId, to: ScreenId, x: number, y: number): void;
  // Shows `to` at once, cancelling any flood in progress.
  set(to: ScreenId): void;
}

// A plate is keyed by screen, so a skipped screen takes its pattern with it.
// firstGuess reuses the blue chevrons of showingUp.
const PLATE_CLASS: Record<ScreenId, string> = {
  opener: classes.P1,
  showingUp: classes.P2,
  firstGuess: classes.P2,
  streak: classes.P3,
  signature: classes.P4,
  types: classes.P5,
  clock: classes.P6,
  average: classes.P7,
  card: classes.P8,
  thanks: classes.P9,
};

const FLOOD_EASING = "cubic-bezier(.6,0,.3,1)";

// Stacking inside .Bg: resting plates 0, the plate on show 1, the black edge 2, a plate
// arriving 3.
const Z_RESTING = 0;
const Z_SHOWN = 1;
const Z_ARRIVING = 3;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface PlateProps {
  id: ScreenId;
  ref?: React.Ref<HTMLDivElement>;
  style?: React.CSSProperties;
}

// One plate: a colour with its moving pattern. Used on its own by the poster screens.
export const Plate: React.FC<PlateProps> = ({ id, ref, style }) => (
  <div ref={ref} className={clsx(classes.Plate, PLATE_CLASS[id])} style={style}>
    {id === "opener" && (
      <>
        <i />
        <i />
        <i />
        <i />
      </>
    )}
  </div>
);

interface BackgroundProps {
  // The plates to stack, normally the story's screens.
  screens: ScreenId[];
  // The plate on show on first render. Later changes go through the handle.
  initial: ScreenId;
  ref?: React.Ref<BackgroundHandle>;
}

// The living background: one plate per screen, stacked, with a black edge for floods.
// Plates are moved by the handle rather than by props, because a flood is an animation
// the page runs and React does not need to see.
const Background: React.FC<BackgroundProps> = ({ screens, initial, ref }) => {
  const plates = useRef(new Map<ScreenId, HTMLDivElement>());
  const ink = useRef<HTMLDivElement>(null);
  const running = useRef<{ animations: Animation[]; timer?: number }>({
    animations: [],
  });

  const stop = () => {
    window.clearTimeout(running.current.timer);
    running.current.animations.forEach((a) => a.cancel());
    running.current = { animations: [] };
    if (ink.current) ink.current.style.display = "none";
  };

  const place = (to: ScreenId, from?: ScreenId) => {
    plates.current.forEach((plate, id) => {
      plate.style.zIndex = String(
        id === to ? (from ? Z_ARRIVING : Z_SHOWN) : id === from ? Z_SHOWN : Z_RESTING,
      );
    });
  };

  const set = (to: ScreenId) => {
    stop();
    place(to);
  };

  const flood = (from: ScreenId, to: ScreenId, x: number, y: number) => {
    const arriving = plates.current.get(to);
    if (!arriving || from === to || !ink.current) return set(to);
    stop();
    place(to, from);

    if (prefersReducedMotion()) {
      running.current.animations = [
        arriving.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: TRANSITION.fadeMs,
          fill: "backwards",
        }),
      ];
      running.current.timer = window.setTimeout(() => set(to), TRANSITION.fadeMs);
      return;
    }

    const reveal = [
      { clipPath: `circle(0% at ${x}px ${y}px)` },
      { clipPath: `circle(150% at ${x}px ${y}px)` },
    ];
    ink.current.style.display = "block";
    running.current.animations = [
      ink.current.animate(reveal, {
        duration: TRANSITION.floodMs,
        easing: FLOOD_EASING,
        fill: "both",
      }),
      arriving.animate(reveal, {
        duration: TRANSITION.floodMs,
        delay: TRANSITION.floodLeadMs,
        easing: FLOOD_EASING,
        fill: "backwards",
      }),
    ];
    running.current.timer = window.setTimeout(() => set(to), TRANSITION.floodDoneMs);
  };

  useImperativeHandle(ref, () => ({ flood, set }));
  // Leaving the page mid-flood must not leave timers behind.
  useEffect(() => stop, []);

  return (
    <div className={classes.Bg}>
      {screens.map((id) => (
        <Plate
          key={id}
          id={id}
          ref={(el) => {
            if (el) plates.current.set(id, el);
            else plates.current.delete(id);
          }}
          style={{ zIndex: id === initial ? Z_SHOWN : Z_RESTING }}
        />
      ))}
      <div ref={ink} className={classes.Ink} />
    </div>
  );
};

export default Background;
