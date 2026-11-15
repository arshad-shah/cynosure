import type { IconData } from "./types.js";

export const umbrella: IconData = {
  name: "umbrella",
  category: "nature",
  body: [
    ["path", { d: "M3.5 12a8.5 8.5 0 0 1 17 0z", animate: true }],
    ["path", { d: "M12 12v6.5a2 2 0 0 1-4 0", animate: true }],
  ],
  motion: "tilt",
};
