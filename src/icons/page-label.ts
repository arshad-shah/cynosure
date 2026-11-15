import type { IconData } from "./types.js";

export const pageLabel: IconData = {
  name: "page-label",
  category: "editing",
  body: [
    ["rect", { x: 5.5, y: 3.5, width: 13, height: 17, rx: 2.5 }],
    ["path", { d: "M8.5 8h7" }],
    ["path", { d: "M8.5 12.25H13l2.5 2.5-2.5 2.5H8.5z", animate: true }],
  ],
  motion: "tilt",
};
