import type { IconData } from "./types.js";

export const pageDuplicate: IconData = {
  name: "page-duplicate",
  category: "editing",
  body: [
    ["path", { d: "M5 16.5V5.5a2 2 0 0 1 2-2h8" }],
    ["rect", { x: 8.5, y: 6.5, width: 11, height: 14.5, rx: 2 }],
    ["path", { d: "M14 11.25v5m-2.5-2.5h5", animate: true }],
  ],
  motion: "pop",
};
