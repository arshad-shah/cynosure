/** Minimal colour maths for theme derivation: parse, OKLCH round-trip, WCAG contrast. No dependencies. */

export class CynosureThemeError extends Error {
  override name = "CynosureThemeError";
}

/** Linear-free sRGB triple, each channel 0..1. */
export type Rgb = [number, number, number];

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

function num(part: string, scale: number): number {
  const p = part.trim();
  return p.endsWith("%") ? (Number.parseFloat(p) / 100) * scale : Number.parseFloat(p);
}

/** Parses hex, rgb(), hsl() and oklch() colours. Throws CynosureThemeError for anything else. */
export function parseColor(input: string): Rgb {
  const value = input.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(value);
  if (hex?.[1]) {
    const h = hex[1].length <= 4 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;
  }
  const fn = /^(rgb|hsl|oklch)a?\(([^)]+)\)$/.exec(value);
  const parts = fn?.[2]?.split(/[\s,/]+/).filter(Boolean) ?? [];
  if (fn && parts.length >= 3) {
    const [a = "", b = "", c = ""] = parts;
    if (fn[1] === "rgb") return [num(a, 255), num(b, 255), num(c, 255)].map((v) => clamp(v / 255)) as Rgb;
    if (fn[1] === "hsl") return hslToRgb(Number.parseFloat(a), num(b, 1), num(c, 1));
    const values = [num(a, 1), num(b, 0.4), Number.parseFloat(c)];
    if (values.every(Number.isFinite)) return oklchToRgb(values[0] ?? 0, values[1] ?? 0, values[2] ?? 0);
  }
  throw new CynosureThemeError(
    `Cynosure cannot read the colour "${input}". Use hex, rgb(), hsl() or oklch().`,
  );
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}

export function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b]
    .map((v) =>
      Math.round(clamp(v) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** OKLCH (L 0..1, C, H degrees) from sRGB. */
export function rgbToOklch(rgb: Rgb): [number, number, number] {
  const [r, g, b] = rgb.map(toLinear) as Rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

/** sRGB from OKLCH, clamped into gamut by reducing chroma. */
export function oklchToRgb(L: number, C: number, H: number): Rgb {
  for (let c = C; c >= 0; c -= 0.005) {
    const h = (H * Math.PI) / 180;
    const A = c * Math.cos(h);
    const B = c * Math.sin(h);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    const rgb = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ].map(fromLinear);
    if (rgb.every((v) => v >= -0.001 && v <= 1.001) || c === 0) return rgb.map((v) => clamp(v)) as Rgb;
  }
  return [L, L, L];
}

/** Shifts OKLCH lightness by `delta`, returning hex. */
export function shiftLightness(color: string, delta: number): string {
  const [L, C, H] = rgbToOklch(parseColor(color));
  return toHex(oklchToRgb(clamp(L + delta), C, H));
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map(toLinear) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two colours (1..21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(parseColor(a)), luminance(parseColor(b))].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

/** The candidate with the highest contrast against `background`. */
export function bestContrast(background: string, candidates: readonly string[]): string {
  return (
    [...candidates].sort((x, y) => contrastRatio(y, background) - contrastRatio(x, background))[0] ??
    "#000000"
  );
}
