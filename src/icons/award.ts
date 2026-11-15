import type { IconData } from "./types.js";

export const award: IconData = {
  name: "award",
  category: "status",
  body: [
    ["circle", { cx: 12, cy: 9, r: 5.5, animate: true }],
    ["path", { d: "m8.75 13.5-1 7 4.25-2 4.25 2-1-7" }],
  ],
  motion: "pop",
};
