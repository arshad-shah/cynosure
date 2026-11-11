import type { IconData } from "./types.js";

export const unlock: IconData = {
  name: "unlock",
  category: "security",
  body: [
    ["rect", { x: 4.5, y: 10.5, width: 15, height: 10, rx: 2.5 }],
    ["path", { d: "M8 10.5V8a4 4 0 0 1 7.6-1.7", animate: true }],
  ],
  motion: "lift",
};
