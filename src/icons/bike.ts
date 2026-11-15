import type { IconData } from "./types.js";

export const bike: IconData = {
  name: "bike",
  category: "travel",
  body: [
    ["circle", { cx: 6, cy: 16, r: 3.5, animate: true }],
    ["circle", { cx: 18, cy: 16, r: 3.5, animate: true }],
    ["path", { d: "M6 16h6l3.5-7h-6m2.5 7L9 6.5m-1.5 0h3m5 2.5 2.5 7m-3.5-9.5h2l-1 2.5" }],
  ],
  motion: "spin",
};
