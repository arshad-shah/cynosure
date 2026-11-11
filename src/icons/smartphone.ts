import type { IconData } from "./types.js";

export const smartphone: IconData = {
  name: "smartphone",
  category: "devices",
  body: [
    ["rect", { x: 6.5, y: 3, width: 11, height: 18, rx: 3, animate: true }],
    ["path", { d: "M11 17.5h2" }],
  ],
  motion: "pop",
};
