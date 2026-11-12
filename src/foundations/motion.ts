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
