import type { IconData } from "./types.js";

export const sliders: IconData = {
  name: "sliders",
  category: "design",
  body: [
    ["path", { d: "M4 7h8m6 0h2M4 17h2m6 0h8" }],
    ["rect", { x: 12, y: 5, width: 6, height: 4, rx: 1.3, animate: true }],
    ["rect", { x: 6, y: 15, width: 6, height: 4, rx: 1.3 }],
  ],
  motion: "slide",
};
