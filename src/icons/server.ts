import type { IconData } from "./types.js";

export const server: IconData = {
  name: "server",
  category: "data",
  body: [
    ["rect", { x: 3.5, y: 4, width: 17, height: 7, rx: 2 }],
    ["rect", { x: 3.5, y: 13, width: 17, height: 7, rx: 2 }],
    ["path", { d: "M7 7.5h.01M7 16.5h.01", animate: true }],
  ],
  motion: "pop",
};
