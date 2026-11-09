/** Facet icons: 24×24 grid, 1.75 round stroke, softened-square geometry, one optional accent star. */

export type IconMotion =
  | "tilt"
  | "rotate"
  | "flip"
  | "draw"
  | "lift"
  | "drop"
  | "spin"
  | "pop"
  | "nudge"
  | "slide";

/** `animate: true` marks the part that moves when the icon's motion plays. */
interface Part {
  animate?: true;
}
export type IconNode =
  | ["path", Part & { d: string }]
  | ["rect", Part & { x: number; y: number; width: number; height: number; rx?: number }]
  | ["circle", Part & { cx: number; cy: number; r: number }];

export interface IconData {
  /** kebab-case, unique. */
  name: string;
  body: IconNode[];
  /** Top-left of the accent star square (3×3, radius 0.8, unless `size` given: 2.5–3). */
  star?: { x: number; y: number; size?: number };
  motion?: IconMotion;
}
