import type { IconData } from "./types.js";

export const pause: IconData = {
  name: "pause",
  category: "media",
  body: [
    ["rect", { x: 6, y: 4.5, width: 4, height: 15, rx: 1.2, animate: true }],
    ["rect", { x: 14, y: 4.5, width: 4, height: 15, rx: 1.2, animate: true }],
  ],
  motion: "pop",
};
