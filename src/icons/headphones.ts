import type { IconData } from "./types.js";

export const headphones: IconData = {
  name: "headphones",
  category: "media",
  body: [
    ["path", { d: "M4 15.5V12a8 8 0 0 1 16 0v3.5", animate: true }],
    ["rect", { x: 3, y: 14, width: 4, height: 6, rx: 1.5 }],
    ["rect", { x: 17, y: 14, width: 4, height: 6, rx: 1.5 }],
  ],
  motion: "pop",
};
