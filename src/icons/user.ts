import type { IconData } from "./types.js";

export const user: IconData = {
  name: "user",
  category: "people",
  body: [
    ["circle", { cx: 12, cy: 8, r: 4, animate: true }],
    ["path", { d: "M4.5 20.5a7.5 7.5 0 0 1 15 0" }],
  ],
  motion: "pop",
};
