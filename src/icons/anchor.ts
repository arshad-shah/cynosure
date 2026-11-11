import type { IconData } from "./types.js";

export const anchor: IconData = {
  name: "anchor",
  category: "design",
  body: [
    ["circle", { cx: 12, cy: 5, r: 2, animate: true }],
    ["path", { d: "M12 7v14M8 10.5h8M3.5 12a8.5 8.5 0 0 0 17 0" }],
  ],
  motion: "tilt",
};
