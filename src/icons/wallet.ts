import type { IconData } from "./types.js";

export const wallet: IconData = {
  name: "wallet",
  category: "commerce",
  body: [
    ["path", { d: "M19.5 9V8a2 2 0 0 0-2-2h-12a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" }],
    ["path", { d: "m5 6 9.5-2.4A1.5 1.5 0 0 1 16.4 5v1" }],
    ["rect", { x: 14, y: 10, width: 6.5, height: 5, rx: 2, animate: true }],
  ],
  motion: "slide",
};
