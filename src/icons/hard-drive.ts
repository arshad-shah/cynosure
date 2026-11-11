import type { IconData } from "./types.js";

export const hardDrive: IconData = {
  name: "hard-drive",
  category: "devices",
  body: [
    ["rect", { x: 3, y: 12, width: 18, height: 8, rx: 2.5 }],
    [
      "path",
      {
        d: "M3.5 13.5l2-6.6A2.5 2.5 0 0 1 7.9 5h8.2a2.5 2.5 0 0 1 2.4 1.9l2 6.6",
      },
    ],
    ["path", { d: "M7 16h.01M10.5 16h.01", animate: true }],
  ],
  motion: "pop",
};
