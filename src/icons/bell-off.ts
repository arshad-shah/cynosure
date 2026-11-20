import type { IconData } from "./types.js";

export const bellOff: IconData = {
  name: "bell-off",
  category: "status",
  body: [
    [
      "path",
      {
        d: "M9.22 5.68A6 6 0 0 1 18 11v3.46m-3.04 4.04H4.5l1.5-2V11a6 6 0 0 1 .15-1.32M10 20.5a2.2 2.2 0 0 0 4 0",
      },
    ],
    ["path", { d: "M3.5 3.5l17 17", animate: true }],
  ],
  motion: "pop",
};
