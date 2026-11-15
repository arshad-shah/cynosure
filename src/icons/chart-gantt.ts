import type { IconData } from "./types.js";

export const chartGantt: IconData = {
  name: "chart-gantt",
  category: "charts",
  body: [
    ["path", { d: "M4 4v14.5A1.5 1.5 0 0 0 5.5 20H20" }],
    ["rect", { x: 7, y: 5.5, width: 6, height: 3, rx: 1 }],
    ["rect", { x: 10, y: 10, width: 8, height: 3, rx: 1, animate: true }],
    ["rect", { x: 14, y: 14.5, width: 5, height: 3, rx: 1 }],
  ],
  motion: "slide",
};
