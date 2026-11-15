import type { IconData } from "./types.js";

export const layoutWorkspace: IconData = {
  name: "layout-workspace",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "M3.5 9.5h17" }],
    ["path", { d: "M8.5 9.5v10m7-10v10", animate: true }],
  ],
  motion: "slide",
};
