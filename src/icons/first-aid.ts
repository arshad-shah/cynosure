import type { IconData } from "./types.js";

export const firstAid: IconData = {
  name: "first-aid",
  category: "health",
  body: [
    ["rect", { x: 3, y: 7, width: 18, height: 13, rx: 2.5 }],
    ["path", { d: "M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" }],
    ["path", { d: "M12 10.5v6m-3-3h6", animate: true }],
  ],
  motion: "pop",
};
