import type { IconData } from "./types.js";

export const layoutFocus: IconData = {
  name: "layout-focus",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["rect", { x: 8, y: 14.25, width: 8, height: 2.25, rx: 1.125, animate: true }],
  ],
  motion: "lift",
};
