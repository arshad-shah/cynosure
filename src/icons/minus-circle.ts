import type { IconData } from "./types.js";

export const minusCircle: IconData = {
  name: "minus-circle",
  category: "status",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M8.5 12h7", animate: true }],
  ],
  motion: "pop",
};
