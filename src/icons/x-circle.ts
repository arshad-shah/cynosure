import type { IconData } from "./types.js";

export const xCircle: IconData = {
  name: "x-circle",
  category: "status",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M9.5 9.5l5 5M14.5 9.5l-5 5", animate: true }],
  ],
  motion: "rotate",
};
