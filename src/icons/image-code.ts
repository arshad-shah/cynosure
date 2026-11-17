import type { IconData } from "./types.js";

export const imageCode: IconData = {
  name: "image-code",
  category: "media",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "M9.5 9.5 7 12l2.5 2.5m5-5L17 12l-2.5 2.5", animate: true }],
  ],
  motion: "pop",
};
