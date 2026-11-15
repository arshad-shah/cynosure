import type { IconData } from "./types.js";

export const zoomFitPage: IconData = {
  name: "zoom-fit-page",
  category: "layout",
  body: [
    ["rect", { x: 8.5, y: 7.5, width: 7, height: 9, rx: 1.5 }],
    [
      "path",
      {
        d: "M3.5 8V5A1.5 1.5 0 0 1 5 3.5h3m8 0h3A1.5 1.5 0 0 1 20.5 5v3m0 8v3a1.5 1.5 0 0 1-1.5 1.5h-3m-8 0H5A1.5 1.5 0 0 1 3.5 19v-3",
        animate: true,
      },
    ],
  ],
  motion: "pop",
};
