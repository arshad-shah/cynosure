/**
 * Facet icons are stored as small as they can be drawn identically. `optimizePath` runs svgo's path-data pass on one
 * `d` (shortest of absolute and relative commands, no redundant numbers or commands, numbers rounded to
 * `PRECISION` decimals: a thousandth of a grid unit, invisible at any size). The path is given its real stroke (1.75,
 * round caps and joins), so svgo keeps what a stroke draws: a zero-length segment is a round dot (`M12 7.75h.01`),
 * never "useless".
 *
 * `pnpm icons:optimize` (tools/optimize-icons.ts) applies it to every icon and keeps a change only when the icon
 * renders to the same pixels; `cy new icon` applies it to a new icon; `tests/unit/icons-optimized.test.ts` fails when
 * an icon could still be made smaller.
 */
import { optimize } from "svgo";
import type { IconData, IconNode } from "../src/icons/types";

/** Decimal places kept in path data. 3 is 1/1000 of a 24-unit grid: 0.004px at 96px. */
export const PRECISION = 3;

const STROKE = 'fill="none" stroke="#000" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';

/** The shortest `d` that draws the same stroke; the input when svgo cannot shorten it. */
export function optimizePath(d: string): string {
  const { data } = optimize(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path ${STROKE} d="${d}"/></svg>`,
    {
      multipass: true,
      plugins: [{ name: "convertPathData", params: { floatPrecision: PRECISION } }],
    },
  );
  const out = /\sd="([^"]*)"/.exec(data)?.[1];
  return out && out.length < d.length ? out : d;
}

/** The icon with every path's `d` optimized; rects, circles and the rest unchanged. */
export function optimizeIcon(icon: IconData): IconData {
  const body = icon.body.map((node): IconNode => {
    if (node[0] !== "path") return node;
    const [tag, attrs] = node;
    const d = optimizePath(attrs.d);
    return d === attrs.d ? node : [tag, { ...attrs, d }];
  });
  return { ...icon, body };
}

/** The icon as a standalone stroked SVG (for rendering checks): what `Icon` draws, in black. */
export function iconSvg(icon: IconData, size = 96): string {
  const shapes = icon.body
    .map(([tag, attrs]) => {
      const a = Object.entries(attrs)
        .filter(([k]) => k !== "animate")
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
      return `<${tag} ${a}/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" ${STROKE}>${shapes}</svg>`;
}
