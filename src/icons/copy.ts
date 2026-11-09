import type { IconData } from "./types.js";

export const copy: IconData = {
  name: "copy",
  body: [
    ["rect", { x: 8.5, y: 8.5, width: 11.5, height: 11.5, rx: 2.5 }],
    ["path", { d: "M15.5 8.5V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9.5a1 1 0 0 0 1 1h3.5", animate: true }],
  ],
  motion: "nudge",
};
