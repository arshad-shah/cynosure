import type { IconData } from "./types.js";

export const thermometer: IconData = {
  name: "thermometer",
  category: "nature",
  body: [
    ["path", { d: "M10 14.6V5.5a2 2 0 0 1 4 0v9.1a4 4 0 1 1-4 0" }],
    ["path", { d: "M12 17.5V10", animate: true }],
  ],
  motion: "lift",
};
