import type { IconData } from "./types.js";

export const gitBranch: IconData = {
  name: "git-branch",
  category: "data",
  body: [
    ["circle", { cx: 6.5, cy: 5.5, r: 2 }],
    ["circle", { cx: 6.5, cy: 18.5, r: 2 }],
    ["circle", { cx: 17.5, cy: 7.5, r: 2, animate: true }],
    ["path", { d: "M6.5 7.5v9M17.5 9.5v1a4 4 0 0 1-4 4h-3a4 4 0 0 0-4 2" }],
  ],
  motion: "slide",
};
