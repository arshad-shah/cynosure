import type { IconData } from "./types.js";

export const stepMarker: IconData = {
  name: "step-marker",
  category: "editing",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M10 9.5 12.5 8v8", animate: true }],
  ],
  motion: "pop",
};
