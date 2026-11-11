import type { IconData } from "./types.js";

export const moreHorizontal: IconData = {
  name: "more-horizontal",
  category: "navigation",
  body: [
    ["circle", { cx: 6, cy: 12, r: 1, animate: true }],
    ["circle", { cx: 12, cy: 12, r: 1, animate: true }],
    ["circle", { cx: 18, cy: 12, r: 1, animate: true }],
  ],
  motion: "pop",
};
