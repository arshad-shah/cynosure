import type { IconData } from "./types.js";

export const userPlus: IconData = {
  name: "user-plus",
  category: "people",
  body: [
    ["circle", { cx: 10, cy: 8, r: 4 }],
    ["path", { d: "M3 20.5a7 7 0 0 1 14 0" }],
    ["path", { d: "M19 8v6M16 11h6", animate: true }],
  ],
  motion: "pop",
};
