import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { clamp } from "./math.js";

/**
 * True while an input method is composing (Chinese, Japanese, Korean…): the key belongs to the composition, not the
 * widget. Safari reports the composing Enter only as keyCode 229, so both are checked.
 */
export function isComposing(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  const native = "nativeEvent" in event ? event.nativeEvent : event;
  return native.isComposing || native.keyCode === 229;
}

export interface StepKeyOptions {
  value: number;
  min: number;
  max: number;
  step: number;
  /** Shift+arrows and Page Up/Down. Default `step × 10`. */
  big?: number;
  /** Which arrows move it: both pairs (a slider, default), only Left/Right, or only Up/Down. */
  axis?: "both" | "x" | "y";
  /** Right to left: Left adds and Right takes away. */
  rtl?: boolean;
  /** Down adds (a horizontal divider that grows the pane above it). Default: Up adds. */
  downAdds?: boolean;
  /** Only the arrows: no Page Up/Down, Home or End (one axis of a 2D area). */
  arrowsOnly?: boolean;
}

/**
 * The value a slider-style key moves to (WAI-ARIA APG slider), or undefined when the key does nothing: arrows ±step,
 * Shift+arrows and Page Up/Down ±big, Home and End to the ends. Clamped to min and max.
 */
export function stepKey(
  event: { key: string; shiftKey: boolean },
  options: StepKeyOptions,
): number | undefined {
  const { value, min, max, step, big = step * 10, axis = "both", rtl = false, downAdds = false } = options;
  const by = event.shiftKey ? big : step;
  let delta: number | undefined;
  if (axis !== "y" && (event.key === "ArrowRight" || event.key === "ArrowLeft"))
    delta = (event.key === "ArrowRight") !== rtl ? by : -by;
  else if (axis !== "x" && (event.key === "ArrowUp" || event.key === "ArrowDown"))
    delta = (event.key === "ArrowUp") !== downAdds ? by : -by;
  else if (!options.arrowsOnly) {
    if (event.key === "PageUp") delta = big;
    else if (event.key === "PageDown") delta = -big;
    else if (event.key === "Home") return min;
    else if (event.key === "End") return max;
  }
  return delta === undefined ? undefined : clamp(value + delta, min, max);
}
