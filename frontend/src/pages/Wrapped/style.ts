import type { CSSProperties } from "react";

// Passes CSS custom properties to an element, which React's style type does not know.
export const cssVars = (vars: Record<string, string | number>) =>
  vars as CSSProperties;

// Entrance animations start after --d (see Wrapped.module.scss). Takes seconds. A number
// that counts up as the element appears passes the same constant to useCountUp.
export const delay = (seconds: number) => cssVars({ "--d": `${seconds}s` });
