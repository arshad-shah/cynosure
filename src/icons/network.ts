import type { IconData } from "./types.js";

export const network: IconData = {
  name: "network",
  category: "data",
  body: [
    ["rect", { x: 9.5, y: 3, width: 5, height: 5, rx: 1.2, animate: true }],
    ["rect", { x: 3, y: 16, width: 5, height: 5, rx: 1.2 }],
    ["rect", { x: 16, y: 16, width: 5, height: 5, rx: 1.2 }],
    ["path", { d: "M12 8v4M5.5 16v-2a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v2" }],
  ],
  motion: "drop",
};
