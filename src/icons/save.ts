import type { IconData } from "./types.js";

export const save: IconData = {
  name: "save",
  category: "actions",
  body: [
    [
      "path",
      { d: "M5.5 4h10L20 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4z" },
    ],
    ["path", { d: "M8 4v4.5h7V4M8 20v-6h8v6", animate: true }],
  ],
  motion: "drop",
};
