import { clamp } from "../../foundations/math.js";
import { parseColor, type Rgb } from "../../tokens/color.js";

/** Reads any CSS colour, alpha included. Named colours and other syntaxes go through the browser's own parser. */
export function readColor(text: string): { rgb: Rgb; a: number } | null {
  const value = text.trim();
  if (!value) return null;
  const alphaPart =
    /\/\s*([\d.]+%?)\s*\)$/.exec(value) ?? /^(?:rgb|hsl)a\((?:[^,]+,){3}\s*([\d.]+%?)\s*\)$/.exec(value);
  const hex8 = /^#(?:[0-9a-f]{4}|[0-9a-f]{8})$/i.test(value);
  let a = 1;
  if (alphaPart?.[1])
    a = alphaPart[1].endsWith("%") ? Number.parseFloat(alphaPart[1]) / 100 : Number.parseFloat(alphaPart[1]);
  if (hex8) {
    const h = value.length === 5 ? (value[4] as string).repeat(2) : value.slice(7, 9);
    a = Number.parseInt(h, 16) / 255;
  }
  try {
    return { rgb: parseColor(hex8 ? value.slice(0, value.length === 5 ? 4 : 7) : value), a: clamp(a) };
  } catch {
    if (typeof document === "undefined") return null;
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    // An invalid colour leaves fillStyle unchanged: try two sentinels so a real colour equal to one still reads.
    for (const sentinel of ["rgb(1 2 3)", "rgb(4 5 6)"]) {
      ctx.fillStyle = sentinel;
      const before = ctx.fillStyle;
      ctx.fillStyle = value;
      if (ctx.fillStyle !== before) {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillRect(0, 0, 1, 1);
        const [r = 0, g = 0, b = 0, alpha = 255] = ctx.getImageData(0, 0, 1, 1).data;
        return { rgb: [r / 255, g / 255, b / 255], a: alpha / 255 };
      }
    }
    return null;
  }
}
