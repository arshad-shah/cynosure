import type { IconData } from "./types.js";

export const film: IconData = {
  name: "film",
  category: "media",
  body: [
    ["rect", { x: 3.5, y: 3.5, width: 17, height: 17, rx: 3 }],
    ["path", { d: "M8 3.5v17m8-17v17M3.5 8.5H8m-4.5 7H8m8-7h4.5m-4.5 7h4.5", animate: true }],
  ],
  motion: "pop",
};
