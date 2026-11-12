import type { IconData } from "./types.js";

export const bookMarked: IconData = {
  name: "book-marked",
  category: "files",
  body: [
    ["path", { d: "M5 19.5v-14A2.5 2.5 0 0 1 7.5 3H19v18H7a2 2 0 0 1-2-2 2 2 0 0 1 2-2h12" }],
    ["path", { d: "M10 3v7l2.25-1.75L14.5 10V3", animate: true }],
  ],
  motion: "drop",
};
