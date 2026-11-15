import type { IconData } from "./types.js";

export const chartColumnStacked: IconData = {
  name: "chart-column-stacked",
  category: "charts",
  body: [
    ["path", { d: "M4 20h16" }],
    ["rect", { x: 6, y: 13, width: 4.5, height: 5, rx: 1 }],
    ["rect", { x: 6, y: 8, width: 4.5, height: 3, rx: 1 }],
    ["rect", { x: 13.5, y: 10.5, width: 4.5, height: 7.5, rx: 1 }],
    ["rect", { x: 13.5, y: 4.5, width: 4.5, height: 4, rx: 1, animate: true }],
  ],
  motion: "lift",
};
