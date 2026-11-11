import type { IconData } from "./types.js";

export const flag: IconData = {
  name: "flag",
  category: "status",
  body: [
    ["path", { d: "M5 21V4.5" }],
    ["path", { d: "M5 4.5h11.5l-2 4.5 2 4.5H5", animate: true }],
  ],
  motion: "lift",
};
