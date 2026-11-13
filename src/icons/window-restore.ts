import type { IconData } from "./types.js";

export const windowRestore: IconData = {
  name: "window-restore",
  category: "layout",
  body: [
    ["rect", { x: 4, y: 8.5, width: 11.5, height: 11.5, rx: 2.5 }],
    ["path", { d: "M8.5 8.5V6.5a2 2 0 0 1 2-2H18a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2h-2.5", animate: true }],
  ],
  motion: "nudge",
};
