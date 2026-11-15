import type { IconData } from "./types.js";

export const scale: IconData = {
  name: "scale",
  category: "design",
  body: [
    ["path", { d: "M11 3.5H6A2.5 2.5 0 0 0 3.5 6v12A2.5 2.5 0 0 0 6 20.5h12a2.5 2.5 0 0 0 2.5-2.5v-5" }],
    ["rect", { x: 7, y: 12, width: 5, height: 5, rx: 1.25 }],
    ["path", { d: "M14 10l6.5-6.5M15 3.5h5.5V9", animate: true }],
  ],
  motion: "nudge",
};
