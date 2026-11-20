import type { IconData } from "./types.js";

export const monitorUp: IconData = {
  name: "monitor-up",
  category: "devices",
  body: [
    ["rect", { x: 3, y: 4, width: 18, height: 12.5, rx: 2.5 }],
    ["path", { d: "M8.5 20.5h7m-3.5-4v4" }],
    ["path", { d: "M12 12.5V7.25M9.75 9.5 12 7.25l2.25 2.25", animate: true }],
  ],
  motion: "lift",
};
