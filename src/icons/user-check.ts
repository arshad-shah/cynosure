import type { IconData } from "./types.js";

export const userCheck: IconData = {
  name: "user-check",
  category: "people",
  body: [
    ["circle", { cx: 10, cy: 8, r: 4 }],
    ["path", { d: "M3 20.5a7 7 0 0 1 14 0" }],
    ["path", { d: "m16 11 2 2 4-4", animate: true }],
  ],
  motion: "pop",
};
