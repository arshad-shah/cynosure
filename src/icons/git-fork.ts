import type { IconData } from "./types.js";

export const gitFork: IconData = {
  name: "git-fork",
  category: "development",
  body: [
    ["circle", { cx: 6.5, cy: 5.5, r: 2 }],
    ["circle", { cx: 17.5, cy: 5.5, r: 2, animate: true }],
    ["circle", { cx: 12, cy: 18.5, r: 2 }],
    ["path", { d: "M6.5 7.5v1a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-1m-5.5 4v5" }],
  ],
  motion: "pop",
};
