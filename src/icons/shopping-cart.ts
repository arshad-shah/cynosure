import type { IconData } from "./types.js";

export const shoppingCart: IconData = {
  name: "shopping-cart",
  category: "commerce",
  body: [
    ["path", { d: "M3 4h2l2.2 11h10.6l2-8H5.6", animate: true }],
    ["circle", { cx: 9, cy: 19, r: 1.5, animate: true }],
    ["circle", { cx: 16.5, cy: 19, r: 1.5, animate: true }],
  ],
  motion: "nudge",
};
