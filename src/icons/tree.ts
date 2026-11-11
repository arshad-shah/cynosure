import type { IconData } from "./types.js";

export const tree: IconData = {
  name: "tree",
  category: "data",
  body: [
    ["rect", { x: 3.5, y: 4, width: 6, height: 5, rx: 1.5 }],
    ["rect", { x: 14.5, y: 15, width: 6, height: 5, rx: 1.5, animate: true }],
    ["path", { d: "M6.5 9v8.5h8" }],
  ],
  motion: "slide",
};
