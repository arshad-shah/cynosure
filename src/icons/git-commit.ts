import type { IconData } from "./types.js";

export const gitCommit: IconData = {
  name: "git-commit",
  category: "development",
  body: [
    ["circle", { cx: 12, cy: 12, r: 2, animate: true }],
    ["path", { d: "M3.5 12H10m4 0h6.5" }],
  ],
  motion: "pop",
};
