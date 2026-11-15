import type { IconData } from "./types.js";

export const minimap: IconData = {
  name: "minimap",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["rect", { x: 12, y: 11.5, width: 5.5, height: 5, rx: 1.25, animate: true }],
  ],
  motion: "pop",
};
