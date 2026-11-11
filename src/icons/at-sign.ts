import type { IconData } from "./types.js";

export const atSign: IconData = {
  name: "at-sign",
  category: "communication",
  body: [
    ["circle", { cx: 12, cy: 12, r: 3.5 }],
    ["path", { d: "M15.5 8.5V13a2.5 2.5 0 0 0 5 0v-1a8.5 8.5 0 1 0-3.3 6.7", animate: true }],
  ],
  motion: "spin",
};
