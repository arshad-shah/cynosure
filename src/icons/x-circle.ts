import type { IconData } from "./types.js";

export const xCircle: IconData = {
  name: "x-circle",
  category: "status",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "m9.5 9.5 5 5m0-5-5 5", animate: true }],
  ],
  motion: "rotate",
};
