import type { IconData } from "./types.js";

export const monitorDown: IconData = {
  name: "monitor-down",
  category: "devices",
  body: [
    ["rect", { x: 3, y: 4, width: 18, height: 12.5, rx: 2.5 }],
    ["path", { d: "M8.5 20.5h7m-3.5-4v4" }],
    ["path", { d: "M12 7.25v5.25m-2.25-2.25L12 12.5l2.25-2.25", animate: true }],
  ],
  motion: "drop",
};
