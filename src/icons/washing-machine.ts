import type { IconData } from "./types.js";

export const washingMachine: IconData = {
  name: "washing-machine",
  category: "home",
  body: [
    ["rect", { x: 4.5, y: 3, width: 15, height: 18, rx: 2.5 }],
    ["path", { d: "M4.5 7.5h15M8 5.25h.01" }],
    ["circle", { cx: 12, cy: 14.25, r: 4.25 }],
    ["path", { d: "M9.75 14.25c.75-1.2 1.5-1.2 2.25 0s1.5 1.2 2.25 0", animate: true }],
  ],
  motion: "spin",
};
