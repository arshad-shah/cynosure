import type { IconData } from "./types.js";

export const coins: IconData = {
  name: "coins",
  category: "commerce",
  body: [
    ["circle", { cx: 9, cy: 9, r: 5.75, animate: true }],
    ["path", { d: "M14.74 9.26a5.75 5.75 0 1 1-5.48 5.48" }],
    ["path", { d: "M9 6.75v4.5", animate: true }],
  ],
  motion: "flip",
};
