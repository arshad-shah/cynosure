import type { IconData } from "./types.js";

export const flatten: IconData = {
  name: "flatten",
  category: "editing",
  body: [
    ["path", { d: "M12 2.5V9M9.25 6.25 12 9l2.75-2.75", animate: true }],
    ["path", { d: "M12 11.5l8.5 3.25L12 18l-8.5-3.25z" }],
    ["path", { d: "M3.5 18.25 12 21.5l8.5-3.25" }],
  ],
  motion: "drop",
};
