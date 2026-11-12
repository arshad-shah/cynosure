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
  "maths",
  "faith",
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

/** Where a brand mark comes from and how its owner allows it to be used. */
export interface BrandInfo {
  /** The brand's own name, as it writes it. */
  title: string;
  /** The brand's colour (hex without #), for `color="brand"`. */
  hex: string;
  /** The brand's guidelines for using its mark, where it publishes them. */
  guidelines?: string;
  /** Where the mark was taken from. */
  source: string;
}

export interface IconData {
  /** kebab-case, unique. */
  name: string;
  /** Facet icons have a category; brand marks (from `@arshad-shah/cynosure/brands`) are "brands". */
  category: IconCategory | "brands";
  body: IconNode[];
  motion?: IconMotion;
  /** A filled shape (brand marks) rather than Facet's stroke. */
  fill?: true;
  /** Set on brand marks: they are drawn exactly as their owner publishes them, never restyled. */
  brand?: BrandInfo;
}
