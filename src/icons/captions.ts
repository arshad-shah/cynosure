import type { IconData } from "./types.js";

export const captions: IconData = {
  name: "captions",
  category: "media",
  body: [
    ["rect", { x: 3, y: 5, width: 18, height: 14, rx: 3 }],
    ["path", { d: "M7 12.5h4m3 0h3m-10 3h7", animate: true }],
  ],
  motion: "slide",
};
