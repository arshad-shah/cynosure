import type { IconData } from "./types.js";

export const terminal: IconData = {
  name: "terminal",
  category: "data",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "m7.5 10 2.5 2.5L7.5 15m5 0h4", animate: true }],
  ],
  motion: "nudge",
};
