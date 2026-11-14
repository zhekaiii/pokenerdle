import { useCallback, useEffect, useRef } from "react";

// Tilts an element toward the pointer by setting --rx and --ry (-1 to 1 from the element's
// centre) and --f (0 to 1 across it), which the stylesheet turns into a rotation, the
// shadow's slide and the band of light's position. `liveClass` is on the element while a
// pointer is over it, so the stylesheet can drop its easing: the card follows the pointer
// directly, because easing while dragging lagged in Chromium browsers.
//
// Values are written to the element, never held in React state, so tilting does not
// render. One write per animation frame, however many pointer events arrive.
export const useCardTilt = <T extends HTMLElement>(
  enabled: boolean,
  liveClass: string,
) => {
  const ref = useRef<T>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);

  const apply = useCallback(() => {
    frame.current = 0;
    const el = ref.current;
    const at = pointer.current;
    if (!el || !at) return;
    const box = el.getBoundingClientRect();
    const fx = Math.min(1, Math.max(0, (at.x - box.left) / box.width));
    const fy = Math.min(1, Math.max(0, (at.y - box.top) / box.height));
    el.classList.add(liveClass);
    el.style.setProperty("--f", fx.toFixed(3));
    el.style.setProperty("--rx", ((fx - 0.5) * 2).toFixed(3));
    el.style.setProperty("--ry", ((fy - 0.5) * 2).toFixed(3));
  }, [liveClass]);

  const reset = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    pointer.current = null;
    const el = ref.current;
    if (!el) return;
    el.classList.remove(liveClass);
    ["--f", "--rx", "--ry"].forEach((name) => el.style.removeProperty(name));
  }, [liveClass]);

  const move = useCallback(
    (e: React.PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      if (!frame.current) frame.current = requestAnimationFrame(apply);
    },
    [apply],
  );

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Every handler does nothing on a card that is not interactive.
  const handlers = {
    onPointerDown: (e: React.PointerEvent<T>) => {
      if (!enabled) return;
      // Touch is captured so the drag keeps tilting off the edge of the card; the mouse
      // hovers, so it needs no capture.
      if (e.pointerType !== "mouse") e.currentTarget.setPointerCapture(e.pointerId);
      move(e);
    },
    onPointerMove: (e: React.PointerEvent<T>) => {
      if (enabled) move(e);
    },
    onPointerLeave: reset,
    onPointerCancel: reset,
    onPointerUp: (e: React.PointerEvent<T>) => {
      if (e.pointerType !== "mouse") reset();
    },
  };

  return { ref, handlers };
};
