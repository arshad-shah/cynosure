import type { IconData } from "./types.js";

export const cpu: IconData = {
  name: "cpu",
  category: "devices",
  body: [
    ["rect", { x: 6.5, y: 6.5, width: 11, height: 11, rx: 2.5 }],
    ["rect", { x: 10, y: 10, width: 4, height: 4, rx: 1, animate: true }],
    ["path", { d: "M9.5 3.5v3m5-3v3m-5 11v3m5-3v3m-11-11h3m-3 5h3m11-5h3m-3 5h3" }],
  ],
  motion: "pop",
};
