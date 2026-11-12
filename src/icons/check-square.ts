import type { IconData } from "./types.js";

export const checkSquare: IconData = {
  name: "check-square",
  category: "status",
  body: [
    ["path", { d: "M20 12v5.5a3 3 0 0 1-3 3H6.5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h9" }],
    ["path", { d: "M8.5 11l3.5 3.5 8.5-9", animate: true }],
  ],
  motion: "draw",
};
