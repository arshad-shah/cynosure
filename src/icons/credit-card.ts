import type { IconData } from "./types.js";

export const creditCard: IconData = {
  name: "credit-card",
  category: "commerce",
  body: [
    ["rect", { x: 3, y: 5.5, width: 18, height: 13, rx: 2.5, animate: true }],
    ["path", { d: "M3 10h18M6.5 14.5h3", animate: true }],
  ],
  motion: "slide",
};
