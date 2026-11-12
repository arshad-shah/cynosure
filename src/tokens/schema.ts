/** The complete Cynosure token schema. Every visual property of every component resolves to one of these. */

export type Size = "sm" | "md" | "lg";
/**
 * `Size` plus `xs`: about 20px tall, for dense desktop chrome (toolbars, inspectors). Only Button, IconButton, Select,
 * TextField, ProgressBar and SegmentedControl take it; their hit area still reaches 24px (44px on coarse pointers).
 */
export type DenseSize = "xs" | Size;
/** Semantic colour shared by every component prop named `tone`. */
export type Tone = "accent" | "neutral" | "danger" | "success" | "warning" | "info";
export type Scale = "compact" | "comfortable" | "spacious" | number;
export type PaletteName = "light" | "dark" | "light-contrast" | "dark-contrast";

export interface ColorTokens {
  bg: string;
  surface: string;
  surfaceRaised: string;
  soft: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentHover: string;
  accentActive: string;
  accentSoft: string;
  onAccent: string;
  ring: string;
  success: string;
  onSuccess: string;
  warning: string;
  onWarning: string;
  danger: string;
  onDanger: string;
  info: string;
  onInfo: string;
  /** Text versions of each tone, readable (≥ 4.5:1) on the surface and on the tone's soft tint. */
  accentText: string;
  dangerText: string;
  successText: string;
  warningText: string;
  infoText: string;
  /**
   * Code: one colour per syntax role, for code blocks and editors (`docs/code-editors.md`). Each reads at least 4.5:1 on
   * the surface, the soft fill and the background (7:1 in the contrast palettes). Keywords follow the accent.
   */
  syntaxComment: string;
  syntaxKeyword: string;
  syntaxString: string;
  syntaxNumber: string;
  syntaxFunction: string;
  syntaxType: string;
  syntaxVariable: string;
  syntaxProperty: string;
  syntaxOperator: string;
  syntaxTag: string;
  syntaxAttribute: string;
  syntaxRegexp: string;
  /**
   * Data visualisation: eight categorical colours for chart series, the first being the accent. Each reads at least 3:1
   * on the background, surface and raised surface (graphics contrast) and they stay apart from each other. CSS:
   * `--cy-color-series-1` to `--cy-color-series-8`. A palette patch must give all eight.
   */
  seriesColors: string[];
}

export interface MotionTokens {
  /** Milliseconds. */
  fast: number;
  base: number;
  slow: number;
  ease: string;
  easeInOut: string;
}

/** Lengths are CSS px numbers, already multiplied by `scale`. */
export interface GlobalTokens {
  scale: number;
  control: { height: Record<Size, number> };
  radius: { factor: number; segment: number; sm: number; md: number; lg: number; card: number; full: number };
  space: Record<"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10", number>;
  font: {
    sans: string;
    mono: string;
    display: string;
    size: Record<"xs" | "sm" | "md" | "lg" | "xl" | "2xl", number>;
    weight: { regular: number; medium: number; bold: number };
    lineHeight: number;
    eyebrow: { size: number; tracking: string };
  };
  border: { width: number; focus: number };
  shadow: { sm: string; md: string; lg: string; lit: string };
  motion: MotionTokens;
  z: { dropdown: number; overlay: number; toast: number; tooltip: number };
  hit: { min: number; coarse: number };
}

/**
 * Per-component tokens. Each component augments this interface:
 * `declare module "../../tokens/schema.js" { interface ComponentTokens { button: ButtonTokens } }`.
 * Values are CSS strings; defaults live in the component's CSS as `var()` fallbacks.
 */
// biome-ignore lint/suspicious/noEmptyInterface: augmented by components via declaration merging
export interface ComponentTokens {}

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export interface ThemeInput {
  /**
   * Fixes the theme to one mode: a dark-only theme (Midnight) uses its dark palettes whatever the colour mode, and
   * `CynosureTheme` sets that mode on its wrapper. Omit to follow the colour mode.
   */
  mode?: "light" | "dark";
  /** Any hex, rgb(), hsl() or oklch() colour. */
  accent?: string;
  scale?: Scale;
  /** Multiplier on the Facet radius factor (1 = default, 0 = square). */
  radius?: number;
  font?: Partial<Record<"sans" | "mono" | "display", string>>;
  motion?: "reduced" | Partial<MotionTokens>;
  tokens?: DeepPartial<GlobalTokens>;
  palettes?: Partial<Record<PaletteName, Partial<ColorTokens>>>;
  components?: { [K in keyof ComponentTokens]?: Partial<ComponentTokens[K]> } & Record<
    string,
    Record<string, string> | undefined
  >;
}

export interface Theme {
  global: GlobalTokens;
  palettes: Record<PaletteName, ColorTokens>;
  components: Record<string, Record<string, string>>;
  /** Set when the theme is fixed to one mode (`ThemeInput.mode`); its light and dark palettes are then the same. */
  mode?: "light" | "dark";
}
