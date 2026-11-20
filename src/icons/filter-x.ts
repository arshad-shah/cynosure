import type { IconData } from "./types.js";

export const filterX: IconData = {
  name: "filter-x",
  category: "actions",
  body: [
    ["path", { d: "M3.5 5.5H16L11 12v5.5L8 19v-7z" }],
    ["path", { d: "m15 13.5 5 5m0-5-5 5", animate: true }],
  ],
  motion: "pop",
};
