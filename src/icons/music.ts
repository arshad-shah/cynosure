import type { IconData } from "./types.js";

export const music: IconData = {
  name: "music",
  category: "media",
  body: [
    ["path", { d: "M9 17.5V6l11-2.5V15", animate: true }],
    ["circle", { cx: 6.5, cy: 17.5, r: 2.5 }],
    ["circle", { cx: 17.5, cy: 15, r: 2.5 }],
  ],
  motion: "tilt",
};
