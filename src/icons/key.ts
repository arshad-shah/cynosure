import type { IconData } from "./types.js";

export const key: IconData = {
  name: "key",
  category: "security",
  body: [
    ["circle", { cx: 8, cy: 15.5, r: 4.5 }],
    ["path", { d: "M11.2 12.3L20 3.5M16.5 7L19 9.5M14.5 9l2 2", animate: true }],
  ],
  motion: "tilt",
};
