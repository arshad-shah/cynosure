import type { IconData } from "./types.js";

export const monitor: IconData = {
  name: "monitor",
  category: "devices",
  body: [
    ["rect", { x: 3, y: 4, width: 18, height: 12.5, rx: 2.5, animate: true }],
    ["path", { d: "M8.5 20.5h7M12 16.5v4" }],
  ],
  motion: "lift",
};
