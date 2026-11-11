import type { IconData } from "./types.js";

export const cpu: IconData = {
  name: "cpu",
  category: "devices",
  body: [
    ["rect", { x: 6.5, y: 6.5, width: 11, height: 11, rx: 2.5 }],
    ["rect", { x: 10, y: 10, width: 4, height: 4, rx: 1, animate: true }],
    [
      "path",
      { d: "M9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" },
    ],
  ],
  motion: "pop",
};
