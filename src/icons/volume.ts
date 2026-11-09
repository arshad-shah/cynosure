import type { IconData } from "./types.js";

export const volume: IconData = {
  name: "volume",
  category: "media",
  body: [
    ["path", { d: "M4 9.5v5h3.5L12 19V5L7.5 9.5z" }],
    ["path", { d: "M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11", animate: true }],
  ],
  motion: "pop",
};
