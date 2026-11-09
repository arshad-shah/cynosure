import type { IconData } from "./types.js";

export const camera: IconData = {
  name: "camera",
  category: "media",
  body: [
    ["path", { d: "M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" }],
    ["circle", { cx: 12, cy: 12.5, r: 3.5, animate: true }],
  ],
  motion: "pop",
};
