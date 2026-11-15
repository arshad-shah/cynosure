import type { IconData } from "./types.js";

export const chartPie: IconData = {
  name: "chart-pie",
  category: "charts",
  body: [
    ["path", { d: "M11 5.5a7.5 7.5 0 1 0 7.5 7.5H11z" }],
    ["path", { d: "M13 3.5a7.5 7.5 0 0 1 7.5 7.5H13z", animate: true }],
  ],
  motion: "lift",
};
