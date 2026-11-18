import type { IconData } from "./types.js";

export const aspectRatio: IconData = {
  name: "aspect-ratio",
  category: "design",
  body: [
    ["rect", { x: 3.5, y: 5.5, width: 17, height: 13, rx: 3 }],
    ["path", { d: "M7 12V9h3m7 3v3h-3", animate: true }],
  ],
  motion: "pop",
};
