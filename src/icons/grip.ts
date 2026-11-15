import type { IconData } from "./types.js";

export const grip: IconData = {
  name: "grip",
  category: "actions",
  body: [
    ["circle", { cx: 9, cy: 6, r: 0.75, animate: true }],
    ["circle", { cx: 15, cy: 6, r: 0.75, animate: true }],
    ["circle", { cx: 9, cy: 12, r: 0.75, animate: true }],
    ["circle", { cx: 15, cy: 12, r: 0.75, animate: true }],
    ["circle", { cx: 9, cy: 18, r: 0.75, animate: true }],
    ["circle", { cx: 15, cy: 18, r: 0.75, animate: true }],
  ],
  motion: "slide",
};
