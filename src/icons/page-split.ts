import type { IconData } from "./types.js";

export const pageSplit: IconData = {
  name: "page-split",
  category: "editing",
  body: [
    ["path", { d: "M6 9.5v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4m-12 5v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" }],
    ["path", { d: "M3.5 12h3m4 0h3m4 0h3", animate: true }],
  ],
  motion: "draw",
};
