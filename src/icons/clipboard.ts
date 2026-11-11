import type { IconData } from "./types.js";

export const clipboard: IconData = {
  name: "clipboard",
  category: "files",
  body: [
    ["rect", { x: 5, y: 5, width: 14, height: 15.5, rx: 2.5 }],
    ["rect", { x: 9, y: 3, width: 6, height: 4, rx: 1.2, animate: true }],
  ],
  motion: "lift",
};
