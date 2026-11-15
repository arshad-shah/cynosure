import type { IconData } from "./types.js";

export const layoutTopBottom: IconData = {
  name: "layout-top-bottom",
  category: "layout",
  body: [
    ["rect", { x: 9.5, y: 3, width: 5, height: 5.5, rx: 1.5 }],
    ["rect", { x: 4, y: 15.5, width: 5, height: 5.5, rx: 1.5 }],
    ["rect", { x: 15, y: 15.5, width: 5, height: 5.5, rx: 1.5 }],
    ["path", { d: "M12 8.5V12m-5.5 0h11m-11 0v3.5m11-3.5v3.5", animate: true }],
  ],
  motion: "draw",
};
