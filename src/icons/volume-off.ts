import type { IconData } from "./types.js";

export const volumeOff: IconData = {
  name: "volume-off",
  category: "media",
  body: [
    ["path", { d: "M4 9.5v5h3.5L12 19V5L7.5 9.5z" }],
    ["path", { d: "m16 9.5 5 5m0-5-5 5", animate: true }],
  ],
  motion: "pop",
};
