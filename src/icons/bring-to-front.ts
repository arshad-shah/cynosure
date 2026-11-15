import type { IconData } from "./types.js";

export const bringToFront: IconData = {
  name: "bring-to-front",
  category: "design",
  body: [
    ["rect", { x: 7.5, y: 7.5, width: 9, height: 9, rx: 2, animate: true }],
    [
      "path",
      {
        d: "M7.5 10.5h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2m6 6h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-2",
      },
    ],
  ],
  motion: "lift",
};
