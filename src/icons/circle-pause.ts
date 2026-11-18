import type { IconData } from "./types.js";

export const circlePause: IconData = {
  name: "circle-pause",
  category: "media",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M10 9v6m4-6v6", animate: true }],
  ],
  motion: "pop",
};
