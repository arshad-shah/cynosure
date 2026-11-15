import type { IconData } from "./types.js";

export const train: IconData = {
  name: "train",
  category: "travel",
  body: [
    ["rect", { x: 5.5, y: 3, width: 13, height: 14.5, rx: 3, animate: true }],
    ["path", { d: "M5.5 10.5h13M9 14h.01M15 14h.01", animate: true }],
    ["path", { d: "M8.5 20.5l1.5-3m5.5 3-1.5-3" }],
  ],
  motion: "nudge",
};
