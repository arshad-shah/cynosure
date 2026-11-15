import type { IconData } from "./types.js";

export const idCard: IconData = {
  name: "id-card",
  category: "people",
  body: [
    ["rect", { x: 3, y: 5, width: 18, height: 14, rx: 2.5 }],
    ["circle", { cx: 8.5, cy: 9.75, r: 1.75, animate: true }],
    ["path", { d: "M5.5 16.25a3 3 0 0 1 6 0m3-5.75h3m-3 3.5h3" }],
  ],
  motion: "pop",
};
