/** Two hex digits for a 0–255 channel. */
const hex2 = (v: number) =>
  Math.round(Math.min(255, Math.max(0, v)))
    .toString(16)
    .padStart(2, "0");

const toHex = (r: number, g: number, b: number, a: number) =>
  `#${hex2(r)}${hex2(g)}${hex2(b)}${a < 1 ? hex2(a * 255) : ""}`;

let canvas: CanvasRenderingContext2D | null | undefined;

/** A computed CSS colour (`rgb()`, or a modern form such as `oklab()` or `color(srgb …)`) as sRGB hex. */
function computedToHex(computed: string): string {
  const legacy = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(
    computed,
  );
  if (legacy) {
    const alpha = legacy[4] ? Number.parseFloat(legacy[4]) / (legacy[4].endsWith("%") ? 100 : 1) : 1;
    return toHex(Number(legacy[1]), Number(legacy[2]), Number(legacy[3]), alpha);
  }
  // Any other form: let a canvas convert it to sRGB (one pixel, drawn and read back).
  if (canvas === undefined) {
    try {
      const el = document.createElement("canvas");
      el.width = el.height = 1;
      canvas = el.getContext("2d", { willReadFrequently: true });
    } catch {
      canvas = null;
    }
  }
  if (!canvas) return "";
  canvas.clearRect(0, 0, 1, 1);
  canvas.fillStyle = "#000";
  canvas.fillStyle = computed;
  canvas.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = canvas.getImageData(0, 0, 1, 1).data;
  return toHex(r, g, b, a / 255);
}

/**
 * Resolves any CSS colour value (a colour, `var(--x)`, a bare `--x`, `color-mix()`, `light-dark()`) as `host` sees
 * it, as `#rrggbb` (or `#rrggbbaa` when translucent). `scheme` is the colour scheme `light-dark()` picks from. Returns
 * "" for a value that is no colour, a custom property that is not set, and on the server. A probe element is added to
 * `host` and removed before returning, so nothing is left behind and nothing is painted.
 */
export function resolveCssColor(value: string, host: Element | null, scheme: "light" | "dark"): string {
  if (!host || typeof getComputedStyle !== "function") return "";
  const trimmed = value.trim();
  const css = trimmed.startsWith("--") ? `var(${trimmed})` : trimmed;
  const bare = /^var\(\s*(--[\w-]+)\s*\)$/.exec(css);
  if (
    bare &&
    getComputedStyle(host)
      .getPropertyValue(bare[1] as string)
      .trim() === ""
  )
    return "";
  const probe = host.ownerDocument.createElement("span");
  probe.hidden = true;
  probe.setAttribute("aria-hidden", "true");
  probe.style.setProperty("color-scheme", scheme);
  probe.style.setProperty("color", css);
  if (!probe.style.getPropertyValue("color")) return "";
  host.appendChild(probe);
  try {
    return computedToHex(getComputedStyle(probe).color);
  } finally {
    probe.remove();
  }
}
