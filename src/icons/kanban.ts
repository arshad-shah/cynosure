import type { IconData } from "./types.js";

export const kanban: IconData = {
  name: "kanban",
  category: "layout",
  body: [
    ["rect", { x: 3.5, y: 3.5, width: 17, height: 17, rx: 3 }],
    ["path", { d: "M8 7.5v9m4-9V12m4-4.5V14", animate: true }],
  ],
  motion: "lift",
};
