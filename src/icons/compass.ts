import type { IconData } from "./types.js";

export const compass: IconData = {
  name: "compass",
  category: "navigation",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M15.5 8.5l-2 5-5 2 2-5z", animate: true }],
  ],
  motion: "rotate",
};
