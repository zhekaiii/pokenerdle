import { useLayoutEffect, useRef } from "react";

const STEP = 0.04;
const MIN_SCALE = 0.4;

// Shrinks a single-line text until it fits its box, by setting --fit (a scale from 1 down
// to MIN_SCALE) on the element. The element's CSS must not wrap and must size its font as
// `calc(<size> * var(--fit, 1))`, which keeps the shrink proportional as the stage scales.
// `text` is what the element shows: when it changes the fit is measured again. It is
// measured again once web fonts finish loading too, because a Chinese name set in the
// fallback font is a different width from the same name in the heavy font.
export const useFitText = <T extends HTMLElement>(text: string) => {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      let scale = 1;
      el.style.setProperty("--fit", String(scale));
      while (el.scrollWidth > el.clientWidth && scale > MIN_SCALE) {
        scale = Math.max(MIN_SCALE, scale - STEP);
        el.style.setProperty("--fit", String(scale));
      }
    };
    fit();
    document.fonts?.addEventListener("loadingdone", fit);
    return () => document.fonts?.removeEventListener("loadingdone", fit);
  }, [text]);

  return ref;
};
