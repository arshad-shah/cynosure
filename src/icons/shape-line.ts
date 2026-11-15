import type { IconData } from "./types.js";

export const shapeLine: IconData = {
  name: "shape-line",
  category: "design",
  body: [
    ["path", { d: "M7 17 17 7", animate: true }],
    ["circle", { cx: 5.5, cy: 18.5, r: 2 }],
    ["circle", { cx: 18.5, cy: 5.5, r: 2 }],
  ],
  motion: "draw",
};
