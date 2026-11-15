import type { IconData } from "./types.js";

export const binary: IconData = {
  name: "binary",
  category: "data",
  body: [
    ["rect", { x: 5, y: 6, width: 5.5, height: 12, rx: 2.75, animate: true }],
    ["path", { d: "m14.5 8.5 3-2.5v12" }],
  ],
  motion: "flip",
};
