import type { IconData } from "./types.js";

export const car: IconData = {
  name: "car",
  category: "travel",
  body: [
    [
      "path",
      {
        d: "M5 17h-.5A1.5 1.5 0 0 1 3 15.5v-2.3a2 2 0 0 1 1.2-1.8l2.3-1L8 7.2A2 2 0 0 1 9.8 6h4.4A2 2 0 0 1 16 7.2l1.5 3.2 2.3 1a2 2 0 0 1 1.2 1.8v2.3a1.5 1.5 0 0 1-1.5 1.5H19M9 17h6m-8.5-6.6h11",
      },
    ],
    ["circle", { cx: 7, cy: 17, r: 2, animate: true }],
    ["circle", { cx: 17, cy: 17, r: 2, animate: true }],
  ],
  motion: "spin",
};
