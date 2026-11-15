import type { IconData } from "./types.js";

export const bot: IconData = {
  name: "bot",
  category: "people",
  body: [
    ["rect", { x: 4, y: 8, width: 16, height: 12, rx: 3 }],
    ["path", { d: "M12 8V5.5" }],
    ["circle", { cx: 12, cy: 4, r: 1.5 }],
    ["path", { d: "M9 13.5V15m6-1.5V15M2 13v3m20-3v3", animate: true }],
  ],
  motion: "pop",
};
