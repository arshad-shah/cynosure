import type { IconData } from "./types.js";

export const workflow: IconData = {
  name: "workflow",
  category: "data",
  body: [
    ["rect", { x: 3, y: 3, width: 7, height: 7, rx: 1.5 }],
    ["rect", { x: 14, y: 14, width: 7, height: 7, rx: 1.5 }],
    ["path", { d: "M6.5 10v3.5a2 2 0 0 0 2 2H14", animate: true }],
  ],
  motion: "slide",
};
