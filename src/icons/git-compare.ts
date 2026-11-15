import type { IconData } from "./types.js";

export const gitCompare: IconData = {
  name: "git-compare",
  category: "development",
  body: [
    ["circle", { cx: 6.5, cy: 5.5, r: 2 }],
    ["circle", { cx: 17.5, cy: 18.5, r: 2 }],
    ["path", { d: "M6.5 7.5V16A2.5 2.5 0 0 0 9 18.5h4M10.5 16l2.5 2.5-2.5 2.5", animate: true }],
    ["path", { d: "M17.5 16.5V8A2.5 2.5 0 0 0 15 5.5h-4M13.5 3 11 5.5 13.5 8" }],
  ],
  motion: "slide",
};
