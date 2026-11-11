import type { IconData } from "./types.js";

export const grid: IconData = {
  name: "grid",
  category: "layout",
  body: [
    ["rect", { x: 4, y: 4, width: 6.5, height: 6.5, rx: 1.8, animate: true }],
    ["rect", { x: 13.5, y: 4, width: 6.5, height: 6.5, rx: 1.8 }],
    ["rect", { x: 4, y: 13.5, width: 6.5, height: 6.5, rx: 1.8 }],
    ["rect", { x: 13.5, y: 13.5, width: 6.5, height: 6.5, rx: 1.8 }],
  ],
  motion: "pop",
};
