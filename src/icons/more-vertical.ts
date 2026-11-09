import type { IconData } from "./types.js";

export const moreVertical: IconData = {
  name: "more-vertical",
  category: "navigation",
  body: [
    ["circle", { cx: 12, cy: 6, r: 1, animate: true }],
    ["circle", { cx: 12, cy: 12, r: 1, animate: true }],
    ["circle", { cx: 12, cy: 18, r: 1, animate: true }],
  ],
  motion: "pop",
};
