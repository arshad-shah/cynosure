import type { IconData } from "./types.js";

export const bot: IconData = {
  name: "bot",
  category: "people",
  body: [
    ["rect", { x: 4, y: 8, width: 16, height: 12, rx: 3 }],
    ["path", { d: "M12 8V5.5" }],
    ["circle", { cx: 12, cy: 4, r: 1.5 }],
    ["path", { d: "M9 13.5v1.5M15 13.5v1.5M2 13v3M22 13v3", animate: true }],
  ],
  motion: "pop",
};
