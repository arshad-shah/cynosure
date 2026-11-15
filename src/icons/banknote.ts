import type { IconData } from "./types.js";

export const banknote: IconData = {
  name: "banknote",
  category: "commerce",
  body: [
    ["rect", { x: 3, y: 6, width: 18, height: 12, rx: 2.5, animate: true }],
    ["circle", { cx: 12, cy: 12, r: 2.5, animate: true }],
    ["path", { d: "M6.5 12h.01M17.5 12h.01", animate: true }],
  ],
  motion: "slide",
};
