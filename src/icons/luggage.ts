import type { IconData } from "./types.js";

export const luggage: IconData = {
  name: "luggage",
  category: "travel",
  body: [
    ["rect", { x: 6, y: 6.5, width: 12, height: 12.5, rx: 2.5, animate: true }],
    ["path", { d: "M9.5 6.5v-2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M10 10v5.5m4-5.5v5.5", animate: true }],
    ["path", { d: "M9 21h.01M15 21h.01" }],
  ],
  motion: "lift",
};
