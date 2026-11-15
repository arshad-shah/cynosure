import type { IconData } from "./types.js";

export const underlineWavy: IconData = {
  name: "underline-wavy",
  category: "editing",
  body: [
    ["path", { d: "M7.5 3.5v6a4.5 4.5 0 0 0 9 0v-6" }],
    ["path", { d: "M4 19.5c1.33-1.6 2.67-1.6 4 0s2.67 1.6 4 0 2.67-1.6 4 0 2.67 1.6 4 0", animate: true }],
  ],
  motion: "draw",
};
