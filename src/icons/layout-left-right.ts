import type { IconData } from "./types.js";

export const layoutLeftRight: IconData = {
  name: "layout-left-right",
  category: "layout",
  body: [
    ["rect", { x: 3, y: 9.5, width: 5.5, height: 5, rx: 1.5 }],
    ["rect", { x: 15.5, y: 4, width: 5.5, height: 5, rx: 1.5 }],
    ["rect", { x: 15.5, y: 15, width: 5.5, height: 5, rx: 1.5 }],
    ["path", { d: "M8.5 12H12m0-5.5v11m0-11h3.5M12 17.5h3.5", animate: true }],
  ],
  motion: "draw",
};
