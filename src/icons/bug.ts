import type { IconData } from "./types.js";

export const bug: IconData = {
  name: "bug",
  category: "data",
  body: [
    ["rect", { x: 7.5, y: 7.5, width: 9, height: 13, rx: 4.5 }],
    [
      "path",
      {
        d: "M12 11v9.5M7.5 12H4M20 12h-3.5M7.5 16.5h-3M19.5 16.5h-3M9 7.5L7.5 4.5M15 7.5l1.5-3",
        animate: true,
      },
    ],
  ],
  motion: "tilt",
};
