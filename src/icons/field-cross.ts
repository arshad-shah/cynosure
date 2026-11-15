import type { IconData } from "./types.js";

export const fieldCross: IconData = {
  name: "field-cross",
  category: "editing",
  body: [
    ["rect", { x: 3, y: 7, width: 18, height: 10, rx: 2.5 }],
    ["path", { d: "M10 10l4 4m0-4-4 4", animate: true }],
  ],
  motion: "rotate",
};
