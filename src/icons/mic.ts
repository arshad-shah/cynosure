import type { IconData } from "./types.js";

export const mic: IconData = {
  name: "mic",
  category: "media",
  body: [
    ["rect", { x: 9, y: 3.5, width: 6, height: 11, rx: 3, animate: true }],
    ["path", { d: "M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3" }],
  ],
  motion: "pop",
};
