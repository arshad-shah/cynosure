import type { IconData } from "./types.js";

export const sunset: IconData = {
  name: "sunset",
  category: "nature",
  body: [
    ["path", { d: "M3 18.5h18m-14.5 0a5.5 5.5 0 0 1 11 0M6.35 12.85l-1.8-1.8m13.1 1.8 1.8-1.8" }],
    ["path", { d: "M12 3.75v6.5M9.75 8 12 10.25 14.25 8", animate: true }],
  ],
  motion: "drop",
};
