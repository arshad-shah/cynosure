import type { IconData } from "./types.js";

export const bus: IconData = {
  name: "bus",
  category: "travel",
  body: [
    [
      "path",
      {
        d: "M5 17H4.5A1.5 1.5 0 0 1 3 15.5V7a2.5 2.5 0 0 1 2.5-2.5h13A2.5 2.5 0 0 1 21 7v8.5a1.5 1.5 0 0 1-1.5 1.5H19M9 17h6M3 11h18M9.5 4.5V11m5-6.5V11",
      },
    ],
    ["circle", { cx: 7, cy: 17, r: 2, animate: true }],
    ["circle", { cx: 17, cy: 17, r: 2, animate: true }],
  ],
  motion: "spin",
};
