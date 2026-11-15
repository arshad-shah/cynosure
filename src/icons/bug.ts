import type { IconData } from "./types.js";

export const bug: IconData = {
  name: "bug",
  category: "development",
  body: [
    ["rect", { x: 7.5, y: 7.5, width: 9, height: 13, rx: 4.5 }],
    [
      "path",
      {
        d: "M12 11v9.5M7.5 12H4m16 0h-3.5m-9 4.5h-3m15 0h-3M9 7.5l-1.5-3m7.5 3 1.5-3",
        animate: true,
      },
    ],
  ],
  motion: "tilt",
};
