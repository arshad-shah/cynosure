import type { IconData } from "./types.js";

export const fieldNext: IconData = {
  name: "field-next",
  category: "editing",
  body: [
    ["rect", { x: 3, y: 7, width: 18, height: 10, rx: 2.5 }],
    ["path", { d: "M7.5 12H16m-3-3 3 3-3 3", animate: true }],
  ],
  motion: "slide",
};
