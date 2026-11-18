import type { IconData } from "./types.js";

export const circleUser: IconData = {
  name: "circle-user",
  category: "people",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["circle", { cx: 12, cy: 10, r: 3, animate: true }],
    ["path", { d: "M6.8 18.21a6.5 6.5 0 0 1 10.4 0" }],
  ],
  motion: "pop",
};
