import type { IconData } from "./types.js";

export const video: IconData = {
  name: "video",
  category: "media",
  body: [
    ["rect", { x: 3, y: 6, width: 12.5, height: 12, rx: 2.5 }],
    ["path", { d: "M15.5 10.5L21 7v10l-5.5-3.5", animate: true }],
  ],
  motion: "nudge",
};
