import type { IconData } from "./types.js";

export const container: IconData = {
  name: "container",
  category: "development",
  body: [
    ["rect", { x: 3, y: 6, width: 18, height: 12, rx: 2, animate: true }],
    ["path", { d: "M8 9.5v5m4-5v5m4-5v5" }],
  ],
  motion: "lift",
};
