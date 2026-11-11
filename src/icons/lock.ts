import type { IconData } from "./types.js";

export const lock: IconData = {
  name: "lock",
  category: "security",
  body: [
    ["rect", { x: 4.5, y: 10.5, width: 15, height: 10, rx: 2.5 }],
    ["path", { d: "M8 10.5V8a4 4 0 0 1 8 0v2.5", animate: true }],
  ],
  motion: "lift",
};
