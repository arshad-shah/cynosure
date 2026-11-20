import type { IconData } from "./types.js";

export const userX: IconData = {
  name: "user-x",
  category: "people",
  body: [
    ["circle", { cx: 10, cy: 8, r: 4 }],
    ["path", { d: "M3 20.5a7 7 0 0 1 14 0" }],
    ["path", { d: "M16.5 8.5 21 13m0-4.5L16.5 13", animate: true }],
  ],
  motion: "pop",
};
