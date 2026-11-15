import type { IconData } from "./types.js";

export const medal: IconData = {
  name: "medal",
  category: "social",
  body: [
    ["path", { d: "M7.5 3.5h9l-3 5.8m-6-5.8 3 5.8" }],
    ["circle", { cx: 12, cy: 14.5, r: 5.5, animate: true }],
    ["circle", { cx: 12, cy: 14.5, r: 2, animate: true }],
  ],
  motion: "tilt",
};
