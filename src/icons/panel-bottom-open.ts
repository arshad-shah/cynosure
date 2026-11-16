import type { IconData } from "./types.js";

export const panelBottomOpen: IconData = {
  name: "panel-bottom-open",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "M3.5 14.5h17" }],
    ["path", { d: "M8.5 11.25 12 7.75l3.5 3.5", animate: true }],
  ],
  motion: "lift",
};
