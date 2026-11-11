import type { IconData } from "./types.js";

export const plug: IconData = {
  name: "plug",
  category: "devices",
  body: [
    ["path", { d: "M9 3v4M15 3v4", animate: true }],
    ["path", { d: "M6.5 7h11v3a5.5 5.5 0 0 1-11 0zM12 15.5V21" }],
  ],
  motion: "drop",
};
