import type { IconData } from "./types.js";

export const smile: IconData = {
  name: "smile",
  category: "social",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M9 9.5h.01M15 9.5h.01" }],
    ["path", { d: "M8.5 14a4 4 0 0 0 7 0", animate: true }],
  ],
  motion: "draw",
};
