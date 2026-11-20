import type { IconData } from "./types.js";

export const gitMerge: IconData = {
  name: "git-merge",
  category: "development",
  body: [
    ["circle", { cx: 6.5, cy: 5.5, r: 2 }],
    ["circle", { cx: 17.5, cy: 17.5, r: 2, animate: true }],
    ["path", { d: "M6.5 7.5v13m.4-8.5a8 8 0 0 0 7.6 5.5h1" }],
  ],
  motion: "slide",
};
