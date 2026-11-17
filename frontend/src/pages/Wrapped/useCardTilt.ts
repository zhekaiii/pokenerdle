import { useCallback, useEffect, useRef } from "react";

interface TiltClasses {
  // On the element while a pointer is on it, so the stylesheet can drop its easing: the
  // card follows the pointer directly, because easing while dragging lagged in Chromium.
  live: string;
  // Added at the first contact and kept. The stylesheet stops the landing wobble with it,
  // so the pointer takes over the transform at once.
  touched: string;
}

// Tilts an element toward the pointer by setting --rx and --ry (-1 to 1 from the element's
// centre) and --f (0 to 1 across it), which the stylesheet turns into a rotation, the
// shadow's slide and the band of light's position.
//
// Values are written to the element, never held in React state, so tilting does not
// render. One write per animation frame, however many pointer events arrive.
//
// A touch drag belongs to the finger that started it: other fingers on the card are
// ignored, and lifting one of them does not reset the card.
export const useCardTilt = <T extends HTMLElement>(
  enabled: boolean,
  { live, touched }: TiltClasses,
) => {
  const ref = useRef<T>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);
  const finger = useRef<number | null>(null); // pointerId of the finger dragging, if any

  const apply = useCallback(() => {
    frame.current = 0;
    const el = ref.current;
    const at = pointer.current;
    if (!el || !at) return;
    const box = el.getBoundingClientRect();
    const fx = Math.min(1, Math.max(0, (at.x - box.left) / box.width));
    const fy = Math.min(1, Math.max(0, (at.y - box.top) / box.height));
    el.classList.add(live);
    el.style.setProperty("--f", fx.toFixed(3));
    el.style.setProperty("--rx", ((fx - 0.5) * 2).toFixed(3));
    el.style.setProperty("--ry", ((fy - 0.5) * 2).toFixed(3));
  }, [live]);

  const reset = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    pointer.current = null;
    finger.current = null;
    const el = ref.current;
    if (!el) return;
    el.classList.remove(live);
    ["--f", "--rx", "--ry"].forEach((name) => el.style.removeProperty(name));
  }, [live]);

  const move = useCallback(
    (e: React.PointerEvent) => {
      ref.current?.classList.add(touched);
      pointer.current = { x: e.clientX, y: e.clientY };
      if (!frame.current) frame.current = requestAnimationFrame(apply);
    },
    [apply, touched],
  );

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // False for a pointer that is not the finger currently dragging.
  const isActive = (e: React.PointerEvent) =>
    finger.current === null || finger.current === e.pointerId;

  // Every handler does nothing on a card that is not interactive.
  const handlers = {
    onPointerDown: (e: React.PointerEvent<T>) => {
      if (!enabled || !isActive(e)) return;
      if (e.pointerType !== "mouse") {
        finger.current = e.pointerId;
        // Capture keeps the drag tilting off the edge of the card. It can fail if the
        // pointer is already gone; the drag then still tilts while it is over the card.
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // nothing to do
        }
      }
      move(e);
    },
    onPointerMove: (e: React.PointerEvent<T>) => {
      if (enabled && isActive(e)) move(e);
    },
    onPointerLeave: (e: React.PointerEvent<T>) => {
      if (isActive(e)) reset();
    },
    onPointerCancel: (e: React.PointerEvent<T>) => {
      if (isActive(e)) reset();
    },
    onPointerUp: (e: React.PointerEvent<T>) => {
      if (e.pointerType !== "mouse" && isActive(e)) reset();
    },
  };

  return { ref, handlers };
};
