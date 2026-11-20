import type { IconData } from "./types.js";

export const flower: IconData = {
  name: "flower",
  category: "nature",
  body: [
    [
      "path",
      {
        d: "M12 3.5a3.82 3.82 0 0 1 4.76 3.45 3.82 3.82 0 0 1-1.82 5.6 3.82 3.82 0 0 1-5.88 0 3.82 3.82 0 0 1-1.82-5.6A3.82 3.82 0 0 1 12 3.5",
        animate: true,
      },
    ],
    ["circle", { cx: 12, cy: 8.5, r: 1.5, animate: true }],
    ["path", { d: "M12 15v2.14m0 2.26V21m0-2c-2.5 0-4-1.25-4-3.5 2.5 0 4 1.25 4 3.5" }],
  ],
  motion: "pop",
};
