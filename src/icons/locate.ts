import type { IconData } from "./types.js";

export const locate: IconData = {
  name: "locate",
  category: "navigation",
  body: [
    ["circle", { cx: 12, cy: 12, r: 7 }],
    ["circle", { cx: 12, cy: 12, r: 2.5, animate: true }],
    ["path", { d: "M12 2.5V5m0 14v2.5M2.5 12H5m14 0h2.5" }],
  ],
  motion: "spin",
};
