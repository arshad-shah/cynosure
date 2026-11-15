import type { IconData } from "./types.js";

export const dice: IconData = {
  name: "dice",
  category: "maths",
  body: [
    ["rect", { x: 4, y: 4, width: 16, height: 16, rx: 3, animate: true }],
    ["circle", { cx: 8.5, cy: 8.5, r: 0.6 }],
    ["circle", { cx: 12, cy: 12, r: 0.6 }],
    ["circle", { cx: 15.5, cy: 15.5, r: 0.6 }],
  ],
  motion: "rotate",
};
