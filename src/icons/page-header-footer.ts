import type { IconData } from "./types.js";

export const pageHeaderFooter: IconData = {
  name: "page-header-footer",
  category: "editing",
  body: [
    ["rect", { x: 5, y: 3.5, width: 14, height: 17, rx: 2 }],
    ["path", { d: "M8.5 7h7m-7 1.5h7m-7 7h7m-7 1.5h7", animate: true }],
  ],
  motion: "pop",
};
