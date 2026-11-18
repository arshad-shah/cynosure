import type { IconData } from "./types.js";

export const piggyBank: IconData = {
  name: "piggy-bank",
  category: "commerce",
  body: [
    ["path", { d: "M17.9 11.3a6.75 5.5 0 1 0 .6 2.7" }],
    ["path", { d: "M17.9 11.3h1.6a1 1 0 0 1 1 1v.7a1 1 0 0 1-1 1h-1" }],
    ["path", { d: "M8.5 18.5V21m6-2.5V21M10 10.5h3.5" }],
    ["circle", { cx: 11.75, cy: 4, r: 1.75, animate: true }],
  ],
  motion: "drop",
};
