import type { IconData } from "./types.js";

export const printer: IconData = {
  name: "printer",
  category: "devices",
  body: [
    ["path", { d: "M7 9V4.5A.5.5 0 0 1 7.5 4h9a.5.5 0 0 1 .5.5V9" }],
    ["rect", { x: 3.5, y: 9, width: 17, height: 7.5, rx: 2 }],
    ["rect", { x: 7, y: 13.5, width: 10, height: 6.5, rx: 1, animate: true }],
  ],
  motion: "lift",
};
