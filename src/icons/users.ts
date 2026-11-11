import type { IconData } from "./types.js";

export const users: IconData = {
  name: "users",
  category: "people",
  body: [
    ["circle", { cx: 9, cy: 8, r: 3.5, animate: true }],
    ["path", { d: "M3 20a6 6 0 0 1 12 0M15.5 4.6a3.5 3.5 0 0 1 0 6.8M17.5 14.2A6 6 0 0 1 21 20" }],
  ],
  motion: "pop",
};
