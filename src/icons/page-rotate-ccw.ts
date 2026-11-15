import type { IconData } from "./types.js";

export const pageRotateCcw: IconData = {
  name: "page-rotate-ccw",
  category: "editing",
  body: [
    ["rect", { x: 10, y: 9.5, width: 10, height: 11, rx: 2 }],
    ["path", { d: "M14 4.5A8 8 0 0 0 5 12m2-2-2 2-2-2", animate: true }],
  ],
  motion: "rotate",
};
