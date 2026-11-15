import type { IconData } from "./types.js";

export const pageRotate: IconData = {
  name: "page-rotate",
  category: "editing",
  body: [
    ["rect", { x: 4, y: 9.5, width: 10, height: 11, rx: 2 }],
    ["path", { d: "M10 4.5a8 8 0 0 1 9 7.5m-2-2 2 2 2-2", animate: true }],
  ],
  motion: "rotate",
};
