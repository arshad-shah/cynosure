import type { IconData } from "./types.js";

export const playCircle: IconData = {
  name: "play-circle",
  category: "media",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M10.25 8.75v6.5L15.5 12z", animate: true }],
  ],
  motion: "pop",
};
