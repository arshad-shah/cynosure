import type { IconData } from "./types.js";

export const terminal: IconData = {
  name: "terminal",
  category: "data",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "M7.5 10l2.5 2.5-2.5 2.5M12.5 15h4", animate: true }],
  ],
  motion: "nudge",
};
