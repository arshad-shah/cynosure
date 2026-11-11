import type { IconData } from "./types.js";

export const mail: IconData = {
  name: "mail",
  category: "communication",
  body: [
    ["rect", { x: 3.5, y: 5, width: 17, height: 14, rx: 2.5 }],
    ["path", { d: "M4 7l8 6 8-6", animate: true }],
  ],
  motion: "drop",
};
