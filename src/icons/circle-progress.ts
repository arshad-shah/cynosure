import type { IconData } from "./types.js";

export const circleProgress: IconData = {
  name: "circle-progress",
  category: "status",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M12 12V7.5a4.5 4.5 0 0 1 4.5 4.5z", animate: true }],
  ],
  motion: "rotate",
};
