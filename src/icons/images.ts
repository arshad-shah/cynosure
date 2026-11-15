import type { IconData } from "./types.js";

export const images: IconData = {
  name: "images",
  category: "files",
  body: [
    ["path", { d: "M7 8V5.5a2 2 0 0 1 2-2h9.5a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2H17", animate: true }],
    ["rect", { x: 3.5, y: 8, width: 13.5, height: 12.5, rx: 2.5 }],
    ["circle", { cx: 8, cy: 12.25, r: 1.25 }],
    ["path", { d: "M17 17.5 13.5 14 7 20.5" }],
  ],
  motion: "lift",
};
