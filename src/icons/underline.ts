import type { IconData } from "./types.js";

export const underline: IconData = {
  name: "underline",
  category: "editing",
  body: [
    ["path", { d: "M7 4v7a5 5 0 0 0 10 0V4" }],
    ["path", { d: "M5 20h14", animate: true }],
  ],
  motion: "slide",
};
