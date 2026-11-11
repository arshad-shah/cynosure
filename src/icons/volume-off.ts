import type { IconData } from "./types.js";

export const volumeOff: IconData = {
  name: "volume-off",
  category: "media",
  body: [
    ["path", { d: "M4 9.5v5h3.5L12 19V5L7.5 9.5z" }],
    ["path", { d: "M16 9.5l5 5M21 9.5l-5 5", animate: true }],
  ],
  motion: "pop",
};
