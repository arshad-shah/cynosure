import type { IconData } from "./types.js";

export const shapes: IconData = {
  name: "shapes",
  category: "design",
  body: [
    [
      "path",
      { d: "M11.13 3.7a1 1 0 0 1 1.74 0l3.36 5.55a1 1 0 0 1-.86 1.5H8.63a1 1 0 0 1-.86-1.5z", animate: true },
    ],
    ["rect", { x: 3.5, y: 13.25, width: 7.25, height: 7.25, rx: 2 }],
    ["circle", { cx: 16.85, cy: 16.85, r: 3.65 }],
  ],
  motion: "pop",
};
