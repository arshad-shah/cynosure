/** The complete Cynosure token schema. Every visual property of every component resolves to one of these. */

export type Size = "sm" | "md" | "lg";
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
  star: { visible: boolean; size: number };
  hit: { min: number; coarse: number };
}

/**
 * Per-component tokens. Each component augments this interface:
 * `declare module "../../tokens/schema" { interface ComponentTokens { button: ButtonTokens } }`.
 * Values are CSS strings; defaults live in the component's CSS as `var()` fallbacks.
 */
// biome-ignore lint/suspicious/noEmptyInterface: augmented by components via declaration merging
export interface ComponentTokens {}

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export interface ThemeInput {
  /** Any hex, rgb(), hsl() or oklch() colour. */
  accent?: string;
  scale?: Scale;
  /** Multiplier on the Facet radius factor (1 = default, 0 = square). */
  radius?: number;
  font?: Partial<Record<"sans" | "mono" | "display", string>>;
  star?: boolean | { size: number };
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
}
