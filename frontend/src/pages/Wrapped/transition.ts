// A screen change, in milliseconds. Story and Background both read these, so the flood,
// the leaving content and the input lock cannot drift apart.
export const TRANSITION = {
  // The flood: the new plate reveals in a circle, trailing the black edge by floodLeadMs.
  floodMs: 650,
  floodLeadMs: 80,
  // Just after the new plate has covered the stage: the black edge is hidden here.
  floodDoneMs: 740,
  // Old content leaves in leaveMs, each piece leaveStaggerMs after the last.
  leaveMs: 380,
  leaveStaggerMs: 35,
  // The new content mounts at enterAtMs and slides in over enterMs.
  enterAtMs: 220,
  enterMs: 500,
  // Everything settles and input is accepted again.
  busyMs: 780,
  // Reduced motion: a plain cross-fade instead of the above.
  fadeMs: 200,
} as const;

// Where a step of `direction` (1 forward, -1 back) from `index` lands, or null when the
// story ignores it: while a change is playing, and past either end.
export const getTargetIndex = (
  index: number,
  length: number,
  direction: 1 | -1,
  busy: boolean,
): number | null => {
  const target = index + direction;
  if (busy || target < 0 || target >= length) return null;
  return target;
};
