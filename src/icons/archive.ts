import type { IconData } from "./types.js";

export const archive: IconData = {
  name: "archive",
  category: "files",
  body: [
    ["rect", { x: 3.5, y: 4, width: 17, height: 4.5, rx: 1.2, animate: true }],
    ["path", { d: "M5 8.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5M10 12.5h4" }],
  ],
  motion: "lift",
};
