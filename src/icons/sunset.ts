import type { IconData } from "./types.js";

export const sunset: IconData = {
  name: "sunset",
  category: "nature",
  body: [
    ["path", { d: "M3 18.5h18m-14.5 0a5.5 5.5 0 0 1 11 0M4.9 12.9l1.6 1.6m12.6-1.6-1.6 1.6" }],
    ["path", { d: "M12 3.5V10M9.5 7.5 12 10l2.5-2.5", animate: true }],
  ],
  motion: "drop",
};
