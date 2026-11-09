import { bestContrast, CynosureThemeError, contrastRatio, parseColor, shiftLightness, toHex } from "./color";
import { BASE_GLOBAL, BASE_PALETTES, DEFAULT_ACCENT, SCALES } from "./defaults";
import type { ColorTokens, GlobalTokens, PaletteName, Theme, ThemeInput } from "./schema";

const ON_CANDIDATES = ["#ffffff", "#16120f", "#000000"] as const;

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
  return typeof input === "number" ? input : SCALES[input ?? "comfortable"];
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
  if (input.star !== undefined)
    g.star =
      typeof input.star === "boolean" ? { ...g.star, visible: input.star } : { visible: true, ...input.star };
  if (input.motion === "reduced") g.motion = { ...g.motion, fast: 0, base: 0, slow: 0 };
  else if (input.motion) g.motion = { ...g.motion, ...input.motion };
  return merge({ ...g, scale }, input.tokens);
}

function accentRoles(
  accent: string,
  surface: string,
): Pick<ColorTokens, "accent" | "accentHover" | "accentActive" | "accentSoft" | "onAccent" | "ring"> {
  const hex = toHex(parseColor(accent));
  return {
    accent: hex,
    accentHover: shiftLightness(hex, -0.05),
    accentActive: shiftLightness(hex, -0.1),
    accentSoft: `color-mix(in oklab, ${hex} 18%, ${surface})`,
    onAccent: bestContrast(hex, ON_CANDIDATES),
    ring: `color-mix(in oklab, ${hex} 28%, transparent)`,
  };
}

/** Raises contrast of a palette: ink to the extreme, muted until ≥ 7:1 against bg, lines from muted. */
function contrastPalette(p: ColorTokens, dark: boolean): ColorTokens {
  const step = dark ? 0.02 : -0.02;
  let muted = p.muted;
  for (let i = 0; i < 40 && contrastRatio(muted, p.bg) < 7; i++) muted = shiftLightness(muted, step);
  return { ...p, ink: dark ? "#ffffff" : "#000000", muted, line: muted };
}

const SAFE_NAME = /^[a-z][a-z0-9-]*$/i;
const UNSAFE_VALUE = /[;{}<>\\\n\r]|\/\*/;

/** Rejects values that could escape a declaration or a <style> block when serialised. */
function safeValue(where: string, value: string): string {
  if (UNSAFE_VALUE.test(value))
    throw new CynosureThemeError(`Cynosure token ${where} has an unsafe value "${value}".`);
  return value;
}

/** Builds a complete theme from a product's partial input. Throws CynosureThemeError for invalid colours. */
export function createTheme(input: ThemeInput = {}): Theme {
  const accent = input.accent ?? DEFAULT_ACCENT;
  const palette = (name: "light" | "dark"): ColorTokens => {
    const base = BASE_PALETTES[name];
    const status = (k: "success" | "warning" | "danger" | "info") => bestContrast(base[k], ON_CANDIDATES);
    return {
      ...base,
      ...accentRoles(accent, base.surface),
      onSuccess: status("success"),
      onWarning: status("warning"),
      onDanger: status("danger"),
      onInfo: status("info"),
    };
  };
  const light = palette("light");
  const dark = palette("dark");
  const palettes: Record<PaletteName, ColorTokens> = {
    light,
    dark,
    "light-contrast": contrastPalette(light, false),
    "dark-contrast": contrastPalette(dark, true),
  };
  for (const [name, patch] of Object.entries(input.palettes ?? {}) as [PaletteName, Partial<ColorTokens>][]) {
    const clean: Partial<ColorTokens> = {};
    for (const [k, v] of Object.entries(patch) as [keyof ColorTokens, string][])
      clean[k] = toHex(parseColor(v));
    palettes[name] = { ...palettes[name], ...clean };
  }
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
  for (const [k, v] of Object.entries(input.font ?? {})) safeValue(`font.${k}`, String(v));
  return { global: buildGlobal(input), palettes, components };
}
