import type { IconData } from "./types.js";

export const chartCandlestick: IconData = {
  name: "chart-candlestick",
  category: "charts",
  body: [
    ["path", { d: "M4 4v14.5A1.5 1.5 0 0 0 5.5 20H20" }],
    ["path", { d: "M9.5 6v2.5m0 6V17" }],
    ["rect", { x: 8, y: 8.5, width: 3, height: 6, rx: 1 }],
    ["path", { d: "M16 4.5V7m0 5v2.5", animate: true }],
    ["rect", { x: 14.5, y: 7, width: 3, height: 5, rx: 1, animate: true }],
  ],
  motion: "lift",
};
