/** Saving a QR code: a PNG of it, and a check that its colours will scan. Kept apart so QRCode does not carry them. */

import { contrastRatio, luminance, parseColor } from "../tokens/color.js";
import { type QrToSvgOptions, qrLayout } from "./qr.js";

/**
 * Whether a code in these colours will scan: dark modules darker than the light ones (inverted codes fail on many
 * phones) with a contrast of at least 4:1. Colours are hex, rgb(), hsl() or oklch(); one it cannot read gives a NaN
 * ratio and `scans: false`.
 */
export function qrContrast(color: string, background: string): { ratio: number; scans: boolean } {
  try {
    const ratio = contrastRatio(color, background);
    return { ratio, scans: ratio >= 4 && luminance(parseColor(color)) < luminance(parseColor(background)) };
  } catch {
    return { ratio: Number.NaN, scans: false };
  }
}

export interface QrToPngOptions extends Omit<QrToSvgOptions, "size" | "label"> {
  /** Device pixels per module. Default 8. */
  scale?: number;
}

/**
 * A QR code as a PNG file (a Blob), drawn module by module on a canvas in the browser: the same code, colours and logo
 * as `qrToSvg` and the QRCode component, `scale` pixels per module. A logo from another site must allow CORS.
 */
export async function qrToPng(
  value: string,
  { quietZone = 4, color = "#000", background = "#fff", logo, scale = 8, ...options }: QrToPngOptions = {},
): Promise<Blob> {
  const { matrix, spot } = qrLayout(value, { ...options, logo });
  const q = Math.max(0, Math.floor(quietZone));
  const k = Math.max(1, Math.round(scale));
  const box = (matrix.length + q * 2) * k;
  const canvas = document.createElement("canvas");
  canvas.width = box;
  canvas.height = box;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, box, box);
  ctx.fillStyle = color;
  matrix.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) ctx.fillRect((x + q) * k, (y + q) * k, k, k);
    });
  });
  if (logo && spot) {
    const picture = new Image();
    picture.crossOrigin = "anonymous";
    picture.src = logo.href;
    await picture.decode();
    const side = spot.side * k;
    const fit = Math.min(side / (picture.naturalWidth || side), side / (picture.naturalHeight || side));
    const [w, h] = [(picture.naturalWidth || side) * fit, (picture.naturalHeight || side) * fit];
    const at = (spot.from + q) * k;
    ctx.drawImage(picture, at + (side - w) / 2, at + (side - h) / 2, w, h);
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The PNG could not be made."))),
      "image/png",
    ),
  );
}
