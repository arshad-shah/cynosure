import type { IconData } from "./types.js";

export const panelRight: IconData = {
  name: "panel-right",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "M14.5 4.5v15", animate: true }],
  ],
  motion: "slide",
};
