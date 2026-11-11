import type { IconData } from "./types.js";

export const chartLine: IconData = {
  name: "chart-line",
  category: "data",
  body: [
    ["path", { d: "M4 4v14.5A1.5 1.5 0 0 0 5.5 20H20" }],
    ["path", { d: "M7.5 14.5l3.5-4 3 3 5-6", animate: true }],
  ],
  motion: "draw",
};
