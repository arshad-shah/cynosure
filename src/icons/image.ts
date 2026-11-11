import type { IconData } from "./types.js";

export const image: IconData = {
  name: "image",
  category: "files",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["circle", { cx: 9, cy: 9.5, r: 1.5, animate: true }],
    ["path", { d: "M20.5 15.5l-4.5-4.5-9 8.5" }],
  ],
  motion: "pop",
};
