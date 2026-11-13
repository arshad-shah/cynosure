/** A computed time ("0.2s" or "150ms") in milliseconds; 0 when it is not a time. */
const toMs = (time: string) => {
  const n = Number.parseFloat(time);
  if (!Number.isFinite(n)) return 0;
  return time.trim().endsWith("ms") ? n : n * 1000;
};

/**
 * How long the transitions in `style` (a computed style) take to finish, in milliseconds: the longest duration plus
 * its own delay. When the two lists differ in length every pairing counts, so it never comes out short. Overlays wait
 * this long for their exit before unmounting (Dialog, Toast).
 */
export function transitionTime(style: Pick<CSSStyleDeclaration, "transitionDuration" | "transitionDelay">) {
  const durations = style.transitionDuration.split(",").map(toMs);
  const delays = style.transitionDelay.split(",").map(toMs);
  let longest = 0;
  for (let i = 0; i < durations.length * delays.length; i++)
    longest = Math.max(longest, (durations[i % durations.length] ?? 0) + (delays[i % delays.length] ?? 0));
  return longest;
}

/**
 * A theme duration, `--cy-motion-<speed>` as `el` sees it, in milliseconds, for animations run from script (detent's
 * reorder animation in SortableList and Tabs): 0 when the person asks for reduced motion, `fallback` when the element
 * has no such token.
 */
export function motionMs(el: Element, speed: "fast" | "base" | "slow" = "slow", fallback = 180) {
  if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return 0;
  const ms = Number.parseFloat(getComputedStyle(el).getPropertyValue(`--cy-motion-${speed}`));
  return Number.isFinite(ms) ? ms : fallback;
}
