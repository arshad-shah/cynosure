import type { IconData } from "./types.js";

export const boxes: IconData = {
  name: "boxes",
  category: "data",
  body: [
    ["rect", { x: 8.25, y: 3.5, width: 7.5, height: 7.5, rx: 2, animate: true }],
    ["rect", { x: 3.5, y: 13, width: 7.5, height: 7.5, rx: 2 }],
    ["rect", { x: 13, y: 13, width: 7.5, height: 7.5, rx: 2 }],
  ],
  motion: "lift",
};
