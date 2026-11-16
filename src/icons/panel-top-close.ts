import type { IconData } from "./types.js";

export const panelTopClose: IconData = {
  name: "panel-top-close",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "M3.5 9.5h17" }],
    ["path", { d: "m8.5 16.25 3.5-3.5 3.5 3.5", animate: true }],
  ],
  motion: "lift",
};
