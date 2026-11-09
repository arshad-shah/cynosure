import type { IconData } from "./types.js";

export const zoomOut: IconData = {
  name: "zoom-out",
  category: "actions",
  body: [
    ["rect", { x: 4, y: 4, width: 12.5, height: 12.5, rx: 4 }],
    ["path", { d: "M16.5 16.5l3.5 3.5M7.5 10.25h5.5" }],
  ],
  motion: "tilt",
};
