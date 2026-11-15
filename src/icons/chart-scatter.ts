import type { IconData } from "./types.js";

export const chartScatter: IconData = {
  name: "chart-scatter",
  category: "charts",
  body: [
    ["path", { d: "M4 4v14.5A1.5 1.5 0 0 0 5.5 20H20" }],
    ["circle", { cx: 8.5, cy: 15.5, r: 0.75 }],
    ["circle", { cx: 11.5, cy: 10.5, r: 0.75 }],
    ["circle", { cx: 15, cy: 13.5, r: 0.75 }],
    ["circle", { cx: 17.5, cy: 7, r: 0.75, animate: true }],
  ],
  motion: "pop",
};
