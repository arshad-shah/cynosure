import type { IconData } from "./types.js";

export const palette: IconData = {
  name: "palette",
  category: "design",
  body: [
    [
      "path",
      {
        d: "M12 3.5a8.5 8.5 0 0 0 0 17c1.4 0 2-.9 2-1.8 0-1.4-1.3-1.7-1.3-2.9 0-1 .8-1.8 1.8-1.8h2A3.5 3.5 0 0 0 20.5 11 8.2 8.2 0 0 0 12 3.5z",
        animate: true,
      },
    ],
    ["circle", { cx: 7.5, cy: 11, r: 1 }],
    ["circle", { cx: 10, cy: 7.5, r: 1 }],
    ["circle", { cx: 14.5, cy: 7.5, r: 1 }],
  ],
  motion: "spin",
};
