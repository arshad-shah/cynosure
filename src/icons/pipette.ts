import type { IconData } from "./types.js";

export const pipette: IconData = {
  name: "pipette",
  category: "design",
  body: [
    ["path", { d: "M12.5 5l6.5 6.5" }],
    ["path", { d: "m15 7.5 2.25-2.25a2.47 2.47 0 0 1 3.5 3.5L18.5 11m-4-4-8 8-1 4 4-1 8-8", animate: true }],
  ],
  motion: "tilt",
};
