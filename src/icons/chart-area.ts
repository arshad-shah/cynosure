import type { IconData } from "./types.js";

export const chartArea: IconData = {
  name: "chart-area",
  category: "charts",
  body: [
    ["path", { d: "M4 4v14.5A1.5 1.5 0 0 0 5.5 20H20" }],
    ["path", { d: "M7.5 17v-3.5l3.5-4 3 3L19 7v10z", animate: true }],
  ],
  motion: "lift",
};
