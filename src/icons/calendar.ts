import type { IconData } from "./types.js";

export const calendar: IconData = {
  name: "calendar",
  category: "time",
  body: [
    ["rect", { x: 3.5, y: 5, width: 17, height: 15.5, rx: 3 }],
    ["path", { d: "M3.5 10h17M8 3.5v3M16 3.5v3", animate: true }],
  ],
  motion: "lift",
};
