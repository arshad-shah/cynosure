import type { IconData } from "./types.js";

export const skipForward: IconData = {
  name: "skip-forward",
  category: "media",
  body: [
    ["path", { d: "M5 5v14l9-7z", animate: true }],
    ["path", { d: "M18.5 5v14" }],
  ],
  motion: "slide",
};
