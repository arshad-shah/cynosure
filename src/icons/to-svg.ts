import type { IconData } from "./types.js";

export interface IconToSvgOptions {
  /** `sm`, `md` (default) or `lg` from the icon tokens, or a size in pixels. */
  size?: "sm" | "md" | "lg" | number;
  /** Gives the SVG `role="img"` and this accessible name. Omit for decorative icons (hidden from screen readers). */
  label?: string;
  /** Any CSS colour; `brand` draws a brand mark in its owner's colour. Default: the current text colour. */
  color?: string;
  /** Extra classes. */
  className?: string;
}

const escapeAttr = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * An icon (Facet or a brand mark) as an SVG string, for pages without React: Astro components, static HTML, plain
 * TypeScript. The markup is the same as the React `Icon`'s, so the icon stylesheet (`styles/icon.css`, or
 * `styles.css`) sizes and colours it the same way.
 */
export function iconToSvg(
  icon: IconData,
  { size = "md", label, color, className }: IconToSvgOptions = {},
): string {
  const paint = color === "brand" ? (icon.brand ? `#${icon.brand.hex}` : undefined) : color;
  const style = [typeof size === "number" ? `--cy-icon-size:${size}px` : "", paint ? `color:${paint}` : ""]
    .filter(Boolean)
    .join(";");
  const attrs = [
    `class="${escapeAttr(className ? `cy-reset cy-icon ${className}` : "cy-reset cy-icon")}"`,
    `viewBox="0 0 24 24"`,
    typeof size === "number" ? "" : `data-size="${size}"`,
    icon.motion ? `data-motion="${icon.motion}"` : "",
    icon.fill ? `data-fill=""` : "",
    style ? `style="${escapeAttr(style)}"` : "",
    `focusable="false"`,
    label ? `role="img" aria-label="${escapeAttr(label)}"` : `aria-hidden="true"`,
  ]
    .filter(Boolean)
    .join(" ");
  const parts = icon.body
    .map(([tag, { animate, ...rest }]) => {
      const a = Object.entries(rest)
        .map(([k, v]) => `${k}="${escapeAttr(String(v))}"`)
        .join(" ");
      return `<${tag} ${a}${animate ? ` class="cy-icon-animate"` : ""}></${tag}>`;
    })
    .join("");
  return `<svg ${attrs}>${parts}</svg>`;
}
