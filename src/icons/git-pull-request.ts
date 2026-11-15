import type { IconData } from "./types.js";

export const gitPullRequest: IconData = {
  name: "git-pull-request",
  category: "development",
  body: [
    ["circle", { cx: 6.5, cy: 5.5, r: 2 }],
    ["circle", { cx: 6.5, cy: 18.5, r: 2 }],
    ["circle", { cx: 17.5, cy: 18.5, r: 2 }],
    ["path", { d: "M6.5 7.5v9m11 0V10a3 3 0 0 0-3-3H11" }],
    ["path", { d: "M13.5 4.5 11 7l2.5 2.5", animate: true }],
  ],
  motion: "nudge",
};
