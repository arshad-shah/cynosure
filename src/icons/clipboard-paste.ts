import type { IconData } from "./types.js";

export const clipboardPaste: IconData = {
  name: "clipboard-paste",
  category: "editing",
  body: [
    ["rect", { x: 5, y: 5, width: 14, height: 15.5, rx: 2.5 }],
    ["rect", { x: 9, y: 3, width: 6, height: 4, rx: 1.2 }],
    ["path", { d: "M12 10.5v6M9.5 14l2.5 2.5 2.5-2.5", animate: true }],
  ],
  motion: "drop",
};
