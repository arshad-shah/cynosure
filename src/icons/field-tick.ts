import type { IconData } from "./types.js";

export const fieldTick: IconData = {
  name: "field-tick",
  category: "editing",
  body: [
    ["rect", { x: 3, y: 7, width: 18, height: 10, rx: 2.5 }],
    ["path", { d: "M9 12.25l2.25 2.25 4-4.25", animate: true }],
  ],
  motion: "draw",
};
