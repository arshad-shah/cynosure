import type { IconData } from "./types.js";

export const monitorDown: IconData = {
  name: "monitor-down",
  category: "devices",
  body: [
    ["rect", { x: 3, y: 4, width: 18, height: 12.5, rx: 2.5 }],
    ["path", { d: "M8.5 20.5h7M12 16.5v4" }],
    ["path", { d: "M12 7.25v5.25M9.75 10.25l2.25 2.25 2.25-2.25", animate: true }],
  ],
  motion: "drop",
};
