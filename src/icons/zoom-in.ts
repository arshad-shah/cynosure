import type { IconData } from "./types.js";

export const zoomIn: IconData = {
  name: "zoom-in",
  category: "actions",
  body: [
    ["rect", { x: 4, y: 4, width: 12.5, height: 12.5, rx: 4 }],
    ["path", { d: "M16.5 16.5 20 20M10.25 7.5V13M7.5 10.25H13" }],
  ],
  motion: "tilt",
};
