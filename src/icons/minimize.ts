import type { IconData } from "./types.js";

export const minimize: IconData = {
  name: "minimize",
  category: "layout",
  body: [
    [
      "path",
      {
        d: "M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4M20 9h-3.5A1.5 1.5 0 0 1 15 7.5V4M15 20v-3.5a1.5 1.5 0 0 1 1.5-1.5H20M4 15h3.5A1.5 1.5 0 0 1 9 16.5V20",
        animate: true,
      },
    ],
  ],
  motion: "pop",
};
