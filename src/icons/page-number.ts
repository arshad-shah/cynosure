import type { IconData } from "./types.js";

export const pageNumber: IconData = {
  name: "page-number",
  category: "editing",
  body: [
    ["rect", { x: 5, y: 3.5, width: 14, height: 17, rx: 2 }],
    ["path", { d: "M10.25 9.75 12.5 7.5V17", animate: true }],
  ],
  motion: "pop",
};
