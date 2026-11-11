import type { IconData } from "./types.js";

export const tablet: IconData = {
  name: "tablet",
  category: "devices",
  body: [
    ["rect", { x: 5, y: 3, width: 14, height: 18, rx: 2.5, animate: true }],
    ["path", { d: "M11 17.5h2" }],
  ],
  motion: "tilt",
};
