import type { IconData } from "./types.js";

export const shadow: IconData = {
  name: "shadow",
  category: "design",
  body: [
    ["rect", { x: 4, y: 4, width: 12, height: 12, rx: 2.5 }],
    ["path", { d: "M20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-9", animate: true }],
  ],
  motion: "slide",
};
