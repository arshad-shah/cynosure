import type { IconData } from "./types.js";

export const eye: IconData = {
  name: "eye",
  category: "actions",
  body: [
    ["path", { d: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" }],
    ["circle", { cx: 12, cy: 12, r: 3, animate: true }],
  ],
  motion: "pop",
};
