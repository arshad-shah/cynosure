/** Test helpers: resolve any CSS colour and measure WCAG contrast as rendered. */

/** Resolves any CSS colour (rgb, oklab, color-mix results…) to sRGB by painting one pixel. */
export function rgb(value: string): [number, number, number] {
  const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

export function contrast(a: string, b: string): number {
  const lum = (c: string) => {
    const [r, g, bl] = rgb(c).map((v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** The first non-transparent background behind an element. */
export function backdrop(el: Element | null): string {
  for (let e = el; e; e = e.parentElement) {
    const bg = getComputedStyle(e).backgroundColor;
    if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
  }
  return "rgb(255, 255, 255)";
}

/** Contrast of an element's text against what is actually behind it. */
export const textContrast = (el: Element) => contrast(getComputedStyle(el).color, backdrop(el));
