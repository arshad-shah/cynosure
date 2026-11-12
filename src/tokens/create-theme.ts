import {
  bestContrast,
  CynosureThemeError,
  contrastRatio,
  mix,
  parseColor,
  readableOn,
  shiftLightness,
  toHex,
} from "./color.js";
import { BASE_GLOBAL, BASE_PALETTES, DEFAULT_ACCENT, SCALES, SYNTAX_HUES } from "./defaults.js";
import type { ColorTokens, GlobalTokens, PaletteName, Theme, ThemeInput } from "./schema.js";

const ON_CANDIDATES = ["#ffffff", "#16120f", "#000000"] as const;
const PALETTE_NAMES: readonly PaletteName[] = ["light", "dark", "light-contrast", "dark-contrast"];

function merge<T>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== "object") return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch)) {
    const current = out[k];
    out[k] =
      v && typeof v === "object" && current && typeof current === "object"
        ? merge(current, v)
        : (v ?? current);
  }
  return out as T;
}

function scaleOf(input: ThemeInput["scale"]): number {
  const scale = typeof input === "number" ? input : SCALES[input ?? "comfortable"];
  if (!Number.isFinite(scale) || scale < 0.5 || scale > 3)
    throw new CynosureThemeError(
      `Cynosure scale must be a number between 0.5 and 3, or compact/comfortable/spacious: got "${String(input)}".`,
    );
  return scale;
}

function buildGlobal(input: ThemeInput): GlobalTokens {
  const scale = scaleOf(input.scale);
  const g = structuredClone(BASE_GLOBAL);
  const px = (n: number) => Math.round(n * scale * 100) / 100;
  for (const k of ["sm", "md", "lg"] as const) g.control.height[k] = px(g.control.height[k]);
  for (const k of Object.keys(g.space) as (keyof typeof g.space)[]) g.space[k] = px(g.space[k]);
  for (const k of Object.keys(g.font.size) as (keyof typeof g.font.size)[])
    g.font.size[k] = px(g.font.size[k]);
  g.font.eyebrow.size = px(g.font.eyebrow.size);
  g.radius.card = px(g.radius.card);
  const factor = g.radius.factor * (input.radius ?? 1);
  g.radius.factor = factor;
  g.radius.segment *= input.radius ?? 1;
  for (const k of ["sm", "md", "lg"] as const)
    g.radius[k] = Math.round(g.control.height[k] * factor * 100) / 100;
  if (input.radius === 0) g.radius.card = 0;
  Object.assign(g.font, input.font);
  if (input.motion === "reduced") g.motion = { ...g.motion, fast: 0, base: 0, slow: 0 };
  else if (input.motion) g.motion = { ...g.motion, ...input.motion };
  const merged = merge({ ...g, scale }, input.tokens);
  // Radius follows the final control heights (the Facet rule) unless radii were overridden explicitly.
  const explicit = input.tokens?.radius ?? {};
  for (const k of ["sm", "md", "lg"] as const)
    if (explicit[k] === undefined)
      merged.radius[k] = Math.round(merged.control.height[k] * merged.radius.factor * 100) / 100;
  return merged;
}

function accentRoles(
  accent: string,
  surface: string,
): Pick<ColorTokens, "accent" | "accentHover" | "accentActive" | "accentSoft" | "onAccent" | "ring"> {
  const hex = toHex(parseColor(accent));
  // Pick on-accent text against the rest, hover and active fills together; hover and active move away from the text.
  const options = ON_CANDIDATES.map((on) => {
    const away = contrastRatio(on, "#ffffff") > contrastRatio(on, "#000000") ? 0.05 : -0.05;
    const hover = shiftLightness(hex, away);
    const active = shiftLightness(hex, away * 2);
    const score = Math.min(contrastRatio(on, hex), contrastRatio(on, hover), contrastRatio(on, active));
    return { on, hover, active, score };
  });
  // White reads best on saturated accents: use it whenever it passes AA on every fill; otherwise the strongest option.
  const white = options.find((o) => o.on === "#ffffff" && o.score >= 4.5);
  const best = white ?? options.reduce((a, b) => (b.score > a.score ? b : a));
  return {
    accent: hex,
    accentHover: best.hover,
    accentActive: best.active,
    accentSoft: `color-mix(in oklab, ${hex} 18%, ${surface})`,
    onAccent: best.on,
    ring: `color-mix(in oklab, ${hex} 28%, transparent)`,
  };
}

type SyntaxKey = Extract<keyof ColorTokens, `syntax${string}`>;
const SYNTAX_KEYS = [
  "syntaxComment",
  "syntaxKeyword",
  "syntaxString",
  "syntaxNumber",
  "syntaxFunction",
  "syntaxType",
  "syntaxVariable",
  "syntaxProperty",
  "syntaxOperator",
  "syntaxTag",
  "syntaxAttribute",
  "syntaxRegexp",
] as const satisfies readonly SyntaxKey[];

/** Code colours, each moved until it reads at `ratio` on every surface code sits on (page, surface, soft fill). */
function syntaxColors(p: ColorTokens, dark: boolean, ratio: number): Pick<ColorTokens, SyntaxKey> {
  const on = [p.bg, p.surface, p.soft, p.surfaceRaised];
  const hues = SYNTAX_HUES[dark ? "dark" : "light"];
  const start: Record<SyntaxKey, string> = {
    syntaxComment: p.muted,
    syntaxKeyword: p.accentText,
    syntaxString: hues.string,
    syntaxNumber: hues.number,
    syntaxFunction: hues.function,
    syntaxType: hues.type,
    syntaxVariable: p.ink,
    syntaxProperty: hues.property,
    syntaxOperator: p.ink,
    syntaxTag: hues.tag,
    syntaxAttribute: hues.attribute,
    syntaxRegexp: hues.regexp,
  };
  return Object.fromEntries(SYNTAX_KEYS.map((k) => [k, readableOn(start[k], on, dark, ratio)])) as Pick<
    ColorTokens,
    SyntaxKey
  >;
}

/** Raises contrast of a palette: ink to the extreme, muted until ≥ 7:1 against bg, lines from muted, code to 7:1. */
function contrastPalette(p: ColorTokens, dark: boolean): ColorTokens {
  const step = dark ? 0.02 : -0.02;
  let muted = p.muted;
  for (let i = 0; i < 40 && contrastRatio(muted, p.bg) < 7; i++) muted = shiftLightness(muted, step);
  const raised = { ...p, ink: dark ? "#ffffff" : "#000000", muted, line: muted };
  const code = Object.fromEntries(
    SYNTAX_KEYS.map((k) => [
      k,
      k === "syntaxVariable" || k === "syntaxOperator"
        ? raised.ink
        : readableOn(p[k], [p.bg, p.surface, p.soft, p.surfaceRaised], dark, 7),
    ]),
  );
  return { ...raised, ...code };
}

const SAFE_NAME = /^[a-z][a-z0-9-]*$/i;
const SAFE_KEY = /^[a-z0-9][a-z0-9-]*$/i;
const UNSAFE_VALUE = /[;{}<>\\\n\r]|\/\*/;

/** Rejects values that could escape a declaration or a <style> block when serialised. */
function safeValue(where: string, value: string): string {
  if (UNSAFE_VALUE.test(value))
    throw new CynosureThemeError(`Cynosure token ${where} has an unsafe value "${value}".`);
  return value;
}

/** Walks the finished theme: every key must be a safe token name and every string a safe value. */
function assertSafe(node: unknown, path: string): void {
  if (typeof node === "string") safeValue(path, node);
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) {
      if (!SAFE_KEY.test(k)) throw new CynosureThemeError(`Cynosure token name "${path}.${k}" is not valid.`);
      assertSafe(v, `${path}.${k}`);
    }
}

/** Checks a palette patch's names and parses its colours. */
function cleanPatch(patch: Partial<ColorTokens> | undefined): Partial<ColorTokens> {
  const clean: Partial<ColorTokens> = {};
  for (const [k, v] of Object.entries(patch ?? {}) as [keyof ColorTokens, string][]) {
    if (!(k in BASE_PALETTES.light) && !DERIVED.has(k))
      throw new CynosureThemeError(`Cynosure palettes have no colour named "${k}".`);
    clean[k] = toHex(parseColor(v));
  }
  return clean;
}

/** Every colour a palette works out from its base colours and accent (a patch can still set any of them). */
const DERIVED = new Set<string>([
  "accent",
  "accentHover",
  "accentActive",
  "accentSoft",
  "onAccent",
  "ring",
  "onSuccess",
  "onWarning",
  "onDanger",
  "onInfo",
  "accentText",
  "dangerText",
  "successText",
  "warningText",
  "infoText",
  ...SYNTAX_KEYS,
]);

/**
 * A complete palette from its base colours and accent. Everything derived (accent roles, on-colours, text colours,
 * code) is worked out from the colours actually used, so a product's surface or accent reaches its hover, soft tint
 * and text colours; colours the patch sets explicitly win over the derived ones.
 */
function derivePalette(
  base: ColorTokens | (typeof BASE_PALETTES)["light"],
  accent: string,
  dark: boolean,
  explicit: Partial<ColorTokens>,
  code: boolean,
): ColorTokens {
  const b = { ...base, ...explicit };
  const status = (k: "success" | "warning" | "danger" | "info") => bestContrast(b[k], ON_CANDIDATES);
  const roles = accentRoles(explicit.accent ?? accent, b.surface);
  // The strongest tint components use is ~24% of the tone over the surface (soft hover).
  const text = (tone: string) => readableOn(tone, [b.surface, mix(tone, b.surface, 0.24)], dark);
  const colors = {
    ...b,
    ...roles,
    onSuccess: status("success"),
    onWarning: status("warning"),
    onDanger: status("danger"),
    onInfo: status("info"),
    accentText: text(roles.accent),
    dangerText: text(b.danger),
    successText: text(b.success),
    warningText: text(b.warning),
    infoText: text(b.info),
    ...explicit,
  } as Omit<ColorTokens, SyntaxKey> as ColorTokens;
  return code ? { ...colors, ...syntaxColors(colors, dark, 4.5), ...explicit } : colors;
}

/** Builds a complete theme from a product's partial input. Throws CynosureThemeError for invalid colours. */
export function createTheme(input: ThemeInput = {}): Theme {
  const accent = input.accent ?? DEFAULT_ACCENT;
  for (const name of Object.keys(input.palettes ?? {}))
    if (!PALETTE_NAMES.includes(name as PaletteName))
      throw new CynosureThemeError(`Cynosure has no palette named "${name}".`);
  const patch = (name: PaletteName) => cleanPatch(input.palettes?.[name]);
  const light = derivePalette(BASE_PALETTES.light, accent, false, patch("light"), true);
  const dark = derivePalette(BASE_PALETTES.dark, accent, true, patch("dark"), true);
  // High contrast starts from the product's own palettes (not Cynosure's) and only raises their contrast.
  const contrast = (from: ColorTokens, isDark: boolean, name: PaletteName) => {
    const raised = contrastPalette(from, isDark);
    const own = patch(name);
    if (Object.keys(own).length === 0) return raised;
    // A contrast patch re-derives the accent roles and text colours from what it changes; code keeps its 7:1 colours.
    return derivePalette(raised, raised.accent, isDark, own, false);
  };
  const palettes: Record<PaletteName, ColorTokens> = {
    light,
    dark,
    "light-contrast": contrast(light, false, "light-contrast"),
    "dark-contrast": contrast(dark, true, "dark-contrast"),
  };
  const components: Record<string, Record<string, string>> = {};
  for (const [name, tokens] of Object.entries(input.components ?? {})) {
    if (!tokens) continue;
    if (!SAFE_NAME.test(name))
      throw new CynosureThemeError(`Cynosure component name "${name}" is not a valid token name.`);
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(tokens)) {
      if (!SAFE_NAME.test(k))
        throw new CynosureThemeError(`Cynosure token name "${name}.${k}" is not valid.`);
      clean[k] = safeValue(`${name}.${k}`, String(v));
    }
    components[name] = clean;
  }
  const theme: Theme = { global: buildGlobal(input), palettes, components };
  assertSafe(theme, "theme");
  return theme;
}
