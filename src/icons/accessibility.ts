import type { IconData } from "./types.js";

export const accessibility: IconData = {
  name: "accessibility",
  category: "health",
  body: [
    ["circle", { cx: 12, cy: 5, r: 1.75, animate: true }],
    ["path", { d: "m5.5 9 6.5 1.5L18.5 9M12 10.5v4m0 0-3 6m3-6 3 6" }],
  ],
  motion: "pop",
};
