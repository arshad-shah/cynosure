import type { IconData } from "./types.js";

export const whiteout: IconData = {
  name: "whiteout",
  category: "editing",
  body: [
    ["rect", { x: 5, y: 3.5, width: 14, height: 17, rx: 2 }],
    ["rect", { x: 8, y: 7, width: 8, height: 5.5, rx: 1.25, animate: true }],
    ["path", { d: "M8 16.5h5" }],
  ],
  motion: "pop",
};
