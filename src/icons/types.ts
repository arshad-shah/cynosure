/** Facet icons: 24×24 grid, 1.75 round stroke, softened-square geometry, stroke only. */

/** Gallery and documentation grouping. Every icon belongs to exactly one category. */
export const ICON_CATEGORIES = [
  "arrows",
  "navigation",
  "actions",
  "editing",
  "files",
  "data",
  "media",
  "communication",
  "status",
  "time",
  "security",
  "people",
  "devices",
  "design",
  "layout",
] as const;
export type IconCategory = (typeof ICON_CATEGORIES)[number];

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
  category: IconCategory;
  body: IconNode[];
  motion?: IconMotion;
}
