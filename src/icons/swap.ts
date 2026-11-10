import type { IconData } from "./types.js";

export const swap: IconData = {
  name: "swap",
  category: "arrows",
  body: [
    ["path", { d: "M4 8h15M15.5 4.5L19 8l-3.5 3.5", animate: true }],
    ["path", { d: "M20 16H5M8.5 12.5L5 16l3.5 3.5" }],
  ],
  motion: "slide",
};
