import type { IconData } from "./types.js";

export const panelRightOpen: IconData = {
  name: "panel-right-open",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "M14.5 4.5v15" }],
    ["path", { d: "M10.75 8.5 7.25 12l3.5 3.5", animate: true }],
  ],
  motion: "slide",
};
