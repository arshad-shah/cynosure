import type { IconData } from "./types.js";

export const squarePlus: IconData = {
  name: "square-plus",
  category: "data",
  body: [
    ["rect", { x: 4, y: 4, width: 16, height: 16, rx: 3 }],
    ["path", { d: "M12 8.5v7M8.5 12h7", animate: true }],
  ],
  motion: "rotate",
};
