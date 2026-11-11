import type { IconData } from "./types.js";

export const calculator: IconData = {
  name: "calculator",
  category: "devices",
  body: [
    ["rect", { x: 5, y: 3, width: 14, height: 18, rx: 2.5 }],
    ["rect", { x: 8, y: 6, width: 8, height: 3.5, rx: 0.8 }],
    [
      "path",
      {
        d: "M9 13h.01M12 13h.01M15 13h.01M9 16.5h.01M12 16.5h.01M15 16.5h.01",
        animate: true,
      },
    ],
  ],
  motion: "pop",
};
