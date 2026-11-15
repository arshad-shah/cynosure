import type { IconData } from "./types.js";

export const panelTop: IconData = {
  name: "panel-top",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["path", { d: "M3.5 9.5h17", animate: true }],
  ],
  motion: "drop",
};
