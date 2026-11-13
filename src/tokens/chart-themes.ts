/**
 * Colours for canvas engines and chart libraries, which cannot read `var(--…)` or `color-mix()`: a palette resolved to
 * plain hex, and a theme object for swift-chart. Nothing here imports a chart library, so Cynosure gains no dependency.
 */
import { mix } from "./color.js";
import { ACCENT_MIX, accentMixCss, createTheme } from "./create-theme.js";
import type { ColorTokens, PaletteName, Theme } from "./schema.js";

/**
 * Every colour of one palette as a concrete value (hex, or 8-digit hex where the colour is translucent), for a canvas
 * `fillStyle` or a chart library's theme.
 */
export function resolveColors(theme: Theme = createTheme(), palette: PaletteName = "light"): ColorTokens {
  const p = theme.palettes[palette];
  const css = accentMixCss(p.accent, p.surface);
  const alpha = Math.round((ACCENT_MIX.ring / 100) * 255)
    .toString(16)
    .padStart(2, "0");
  // Only the mixes createTheme wrote are swapped: a palette that sets its own accentSoft or ring already has hex.
  return {
    ...p,
    accentSoft:
      p.accentSoft === css.accentSoft ? mix(p.accent, p.surface, ACCENT_MIX.accentSoft / 100) : p.accentSoft,
    ring: p.ring === css.ring ? `${p.accent}${alpha}` : p.ring,
    seriesColors: [...p.seriesColors],
  };
}

/**
 * swift-chart's theme shape (`addTheme(name, swiftChartTheme(…))` from `@arshad-shah/swift-chart`), written out so the
 * library is not imported.
 */
export interface SwiftChartTheme {
  /** The chart's page background. */
  bg: string;
  /** Panels and plot areas. */
  surface: string;
  /** Gridlines: quieter than the axis. */
  grid: string;
  /** Labels and values. */
  text: string;
  /** Axis ticks and secondary labels. */
  textMuted: string;
  /** Axis lines. */
  axis: string;
  /** Gains (up candles, positive bars). */
  positive: string;
  /** Losses. */
  negative: string;
  /** Text on an accent-filled mark. */
  onAccent: string;
  /** The series colours, in order (the palette's eight `seriesColors`). */
  colors: string[];
  /** Tooltip fill, border and text. */
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

/** A swift-chart theme from a Cynosure palette. Build one per palette and register it again when the palette changes. */
export function swiftChartTheme(
  theme: Theme = createTheme(),
  palette: PaletteName = "light",
): SwiftChartTheme {
  const p = resolveColors(theme, palette);
  return {
    bg: p.bg,
    surface: p.surface,
    grid: mix(p.line, p.surface, 0.5),
    text: p.ink,
    textMuted: p.muted,
    axis: p.line,
    positive: p.successText,
    negative: p.dangerText,
    onAccent: p.onAccent,
    colors: p.seriesColors,
    tooltipBg: p.surfaceRaised,
    tooltipBorder: p.line,
    tooltipText: p.ink,
  };
}
