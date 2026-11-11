import type { ColorTokens, GlobalTokens } from "./schema.js";

/** Placeholder brand accent; final value is signed off in Storybook (spec §15). */
/** Cynosure ember: the brand accent (white text passes AA on rest, hover and active). */
export const DEFAULT_ACCENT = "#c2410c";

export const SCALES = { compact: 0.875, comfortable: 1, spacious: 1.2 } as const;

type BasePalette = Pick<ColorTokens, "bg" | "surface" | "surfaceRaised" | "soft" | "ink" | "muted" | "line">;
type Status = Pick<ColorTokens, "success" | "warning" | "danger" | "info">;

export const BASE_PALETTES: Record<"light" | "dark", BasePalette & Status> = {
  light: {
    bg: "#f4f1ea",
    surface: "#fbf9f5",
    surfaceRaised: "#ffffff",
    soft: "#ebe6dc",
    ink: "#1d1b18",
    muted: "#6b665e",
    line: "#dcd6cb",
    success: "#2f7d4a",
    warning: "#a8650f",
    danger: "#b4235a",
    info: "#2f66b0",
  },
  dark: {
    bg: "#14120f",
    surface: "#1d1a16",
    surfaceRaised: "#25211c",
    soft: "#28241f",
    ink: "#ece8e1",
    muted: "#a39d93",
    line: "#34302a",
    success: "#5cc282",
    warning: "#e3a548",
    danger: "#ff6b8f",
    info: "#77a6ec",
  },
};

/** The roles of code colours that are not taken from the palette (keywords use the accent, comments the muted ink). */
export type SyntaxHue =
  | "string"
  | "number"
  | "function"
  | "type"
  | "property"
  | "tag"
  | "attribute"
  | "regexp";

/**
 * Starting hues for code, chosen to stay apart from each other and from the ember accent (which keywords use). They are
 * only starting points: createTheme moves each one until it reads at least 4.5:1 on the surfaces code sits on.
 */
export const SYNTAX_HUES: Record<"light" | "dark", Record<SyntaxHue, string>> = {
  light: {
    string: "#3d7a1f",
    number: "#7c3aed",
    function: "#1d5fbf",
    type: "#0f766e",
    property: "#7a4e12",
    tag: "#be185d",
    attribute: "#9a5b00",
    regexp: "#a21caf",
  },
  dark: {
    string: "#a6d189",
    number: "#c4a7ff",
    function: "#8ab4f8",
    type: "#5eead4",
    property: "#e5c07b",
    tag: "#f472b6",
    attribute: "#fbbf24",
    regexp: "#f0abfc",
  },
};

/** Unscaled base values (px at comfortable scale). */
export const BASE_GLOBAL: Omit<GlobalTokens, "scale"> = {
  control: { height: { sm: 26, md: 32, lg: 40 } },
  radius: { factor: 0.3, segment: 0.22, sm: 0, md: 0, lg: 0, card: 14, full: 999 },
  space: { "0": 0, "1": 2, "2": 4, "3": 6, "4": 8, "5": 12, "6": 16, "7": 20, "8": 24, "9": 32, "10": 40 },
  font: {
    sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace',
    display: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    size: { xs: 11, sm: 12, md: 13, lg: 15, xl: 18, "2xl": 22 },
    weight: { regular: 400, medium: 550, bold: 650 },
    lineHeight: 1.5,
    eyebrow: { size: 10.5, tracking: ".08em" },
  },
  border: { width: 1, focus: 3 },
  shadow: {
    sm: "0 1px 2px rgb(0 0 0 / .12)",
    md: "0 6px 20px rgb(0 0 0 / .14)",
    lg: "0 16px 48px rgb(0 0 0 / .22)",
    lit: "inset 0 1px 0 rgb(255 255 255 / .27), 0 1px 0 rgb(0 0 0 / .13)",
  },
  motion: {
    fast: 120,
    base: 200,
    slow: 350,
    ease: "cubic-bezier(.2,.9,.2,1)",
    easeInOut: "cubic-bezier(.65,0,.35,1)",
  },
  z: { dropdown: 1000, overlay: 1100, toast: 1200, tooltip: 1300 },
  hit: { min: 24, coarse: 44 },
};
