import type { IconData } from "./types.js";

export const plusCircle: IconData = {
  name: "plus-circle",
  category: "status",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M12 8.5v7M8.5 12h7", animate: true }],
  ],
  motion: "pop",
};
