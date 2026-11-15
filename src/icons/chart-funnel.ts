import type { IconData } from "./types.js";

export const chartFunnel: IconData = {
  name: "chart-funnel",
  category: "charts",
  body: [
    ["rect", { x: 3.5, y: 4, width: 17, height: 4, rx: 1.5 }],
    ["rect", { x: 6.5, y: 10, width: 11, height: 4, rx: 1.5 }],
    ["rect", { x: 9.5, y: 16, width: 5, height: 4, rx: 1.5, animate: true }],
  ],
  motion: "drop",
};
