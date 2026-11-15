import type { IconData } from "./types.js";

export const chartHistogram: IconData = {
  name: "chart-histogram",
  category: "charts",
  body: [
    ["path", { d: "M4 20h16" }],
    ["path", { d: "M5.5 18v-5H9V7h3.5v3.5H16V15h3.5v3", animate: true }],
    ["path", { d: "M9 13v5m3.5-7.5V18M16 15v3" }],
  ],
  motion: "lift",
};
