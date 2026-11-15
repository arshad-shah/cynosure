import type { IconData } from "./types.js";

export const chartDonut: IconData = {
  name: "chart-donut",
  category: "charts",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["circle", { cx: 12, cy: 12, r: 4 }],
    ["path", { d: "M12 3.5V8m8.5 4H16", animate: true }],
  ],
  motion: "spin",
};
