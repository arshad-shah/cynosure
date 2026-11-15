import type { IconData } from "./types.js";

export const stamp: IconData = {
  name: "stamp",
  category: "editing",
  body: [
    [
      "path",
      {
        d: "M10 10.5V9.25C10 8 8.25 7.5 8.25 5.5a3.75 3.75 0 0 1 7.5 0c0 2-1.75 2.5-1.75 3.75v1.25M5 16v-2.5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3V16z",
        animate: true,
      },
    ],
    ["path", { d: "M5 20h14" }],
  ],
  motion: "drop",
};
