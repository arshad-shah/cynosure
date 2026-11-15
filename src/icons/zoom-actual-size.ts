import type { IconData } from "./types.js";

export const zoomActualSize: IconData = {
  name: "zoom-actual-size",
  category: "layout",
  body: [
    ["path", { d: "m4 9 2.5-2v10m11-8L20 7v10", animate: true }],
    ["path", { d: "M12 10h.01M12 14h.01" }],
  ],
  motion: "pop",
};
