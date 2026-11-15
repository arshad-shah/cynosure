import type { IconData } from "./types.js";

export const zoomFitWidth: IconData = {
  name: "zoom-fit-width",
  category: "layout",
  body: [
    ["rect", { x: 8, y: 3.5, width: 8, height: 17, rx: 2 }],
    ["path", { d: "M5.5 12h-3m2-2-2 2 2 2m14-2h3m-2-2 2 2-2 2", animate: true }],
  ],
  motion: "pop",
};
