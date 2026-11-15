import type { IconData } from "./types.js";

export const trophy: IconData = {
  name: "trophy",
  category: "social",
  body: [
    [
      "path",
      {
        d: "M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0zm0 2H6a2 2 0 0 0 0 4h1.7m8.8-4H18a2 2 0 0 1 0 4h-1.7M12 14v3.5",
        animate: true,
      },
    ],
    ["rect", { x: 8.5, y: 17.5, width: 7, height: 3, rx: 1, animate: true }],
  ],
  motion: "lift",
};
