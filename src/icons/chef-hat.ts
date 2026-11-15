import type { IconData } from "./types.js";

export const chefHat: IconData = {
  name: "chef-hat",
  category: "home",
  body: [
    [
      "path",
      {
        d: "M7.5 16.5v-2.1A3.75 3.75 0 0 1 8.1 7a4.5 4.5 0 0 1 7.8 0 3.75 3.75 0 0 1 .6 7.4v2.1",
        animate: true,
      },
    ],
    ["rect", { x: 7.5, y: 16.5, width: 9, height: 4, rx: 1.5, animate: true }],
  ],
  motion: "lift",
};
