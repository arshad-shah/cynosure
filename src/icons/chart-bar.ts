import type { IconData } from "./types.js";

export const chartBar: IconData = {
  name: "chart-bar",
  category: "data",
  body: [
    ["path", { d: "M4 20h16" }],
    ["rect", { x: 6, y: 12, width: 3, height: 6, rx: 1 }],
    ["rect", { x: 10.5, y: 6, width: 3, height: 12, rx: 1, animate: true }],
    ["rect", { x: 15, y: 9, width: 3, height: 9, rx: 1 }],
  ],
  motion: "lift",
};
