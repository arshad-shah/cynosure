import type { IconData } from "./types.js";

export const timer: IconData = {
  name: "timer",
  category: "time",
  body: [
    ["circle", { cx: 12, cy: 13.5, r: 7 }],
    ["path", { d: "M12 10v3.5l2 2", animate: true }],
    ["path", { d: "M9.5 3.5h5M18.5 6.5L20 5" }],
  ],
  motion: "spin",
};
