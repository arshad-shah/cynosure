import type { IconData } from "./types.js";

export const target: IconData = {
  name: "target",
  category: "design",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["circle", { cx: 12, cy: 12, r: 5 }],
    ["circle", { cx: 12, cy: 12, r: 1.5, animate: true }],
  ],
  motion: "pop",
};
