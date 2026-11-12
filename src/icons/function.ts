import type { IconData } from "./types.js";

export const functionIcon: IconData = {
  name: "function",
  category: "data",
  body: [
    ["rect", { x: 4, y: 4, width: 16, height: 16, rx: 3 }],
    ["path", { d: "M9 17c1.75 0 2.75-1 2.75-2.75V10c0-1.75 1-3 3.25-3M9.25 11.25h5", animate: true }],
  ],
  motion: "draw",
};
