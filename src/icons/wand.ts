import type { IconData } from "./types.js";

export const wand: IconData = {
  name: "wand",
  category: "design",
  body: [
    ["path", { d: "M4 20 14.5 9.5", animate: true }],
    ["path", { d: "M18 3.5v5M15.5 6h5m-13-2v3M6 5.5h3m10 8v3M17.5 15h3" }],
  ],
  motion: "tilt",
};
