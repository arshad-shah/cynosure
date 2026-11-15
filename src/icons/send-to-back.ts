import type { IconData } from "./types.js";

export const sendToBack: IconData = {
  name: "send-to-back",
  category: "design",
  body: [
    ["rect", { x: 3.5, y: 3.5, width: 7, height: 7, rx: 2 }],
    ["rect", { x: 13.5, y: 13.5, width: 7, height: 7, rx: 2 }],
    ["path", { d: "M10.5 7.5h4a2 2 0 0 1 2 2v4m-9-3v4a2 2 0 0 0 2 2h4", animate: true }],
  ],
  motion: "drop",
};
