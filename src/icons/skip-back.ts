import type { IconData } from "./types.js";

export const skipBack: IconData = {
  name: "skip-back",
  category: "media",
  body: [
    ["path", { d: "M19 5v14l-9-7z", animate: true }],
    ["path", { d: "M5.5 5v14" }],
  ],
  motion: "slide",
};
