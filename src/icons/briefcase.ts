import type { IconData } from "./types.js";

export const briefcase: IconData = {
  name: "briefcase",
  category: "files",
  body: [
    ["rect", { x: 3, y: 7, width: 18, height: 13, rx: 2.5 }],
    [
      "path",
      {
        d: "M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18",
        animate: true,
      },
    ],
  ],
  motion: "lift",
};
