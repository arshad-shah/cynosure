import type { IconData } from "./types.js";

export const scissors: IconData = {
  name: "scissors",
  category: "editing",
  body: [
    ["circle", { cx: 6.5, cy: 6.5, r: 2.75 }],
    ["circle", { cx: 6.5, cy: 17.5, r: 2.75 }],
    ["path", { d: "M8.55 15.67L20 5.5M8.55 8.33l3.2 2.85M14.1 13.3L20 18.5", animate: true }],
  ],
  motion: "tilt",
};
