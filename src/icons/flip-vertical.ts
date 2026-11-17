import type { IconData } from "./types.js";

export const flipVertical: IconData = {
  name: "flip-vertical",
  category: "editing",
  body: [
    ["path", { d: "M3 12h2m3.5 0h2m3.5 0h2m3.5 0h2" }],
    ["path", { d: "M6.5 9h11L12 3.5zm0 6h11L12 20.5z", animate: true }],
  ],
  motion: "flip",
};
