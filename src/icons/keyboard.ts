import type { IconData } from "./types.js";

export const keyboard: IconData = {
  name: "keyboard",
  category: "devices",
  body: [
    ["rect", { x: 2.5, y: 6, width: 19, height: 12, rx: 2.5 }],
    ["path", { d: "M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M8 14h8", animate: true }],
  ],
  motion: "pop",
};
