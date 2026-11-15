import type { IconData } from "./types.js";

export const laugh: IconData = {
  name: "laugh",
  category: "social",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M7.75 10a1.75 1.75 0 0 1 3 0m2.5 0a1.75 1.75 0 0 1 3 0" }],
    ["path", { d: "M8 13.5h8a4 4 0 0 1-8 0", animate: true }],
  ],
  motion: "pop",
};
