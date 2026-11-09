import type { IconData } from "./types.js";

export const panelBottom: IconData = {
  name: "panel-bottom",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "M3.5 14.5h17", animate: true }],
  ],
  motion: "lift",
};
