import type { IconData } from "./types.js";

export const panelRightClose: IconData = {
  name: "panel-right-close",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "M14.5 4.5v15" }],
    ["path", { d: "m7.25 8.5 3.5 3.5-3.5 3.5", animate: true }],
  ],
  motion: "slide",
};
