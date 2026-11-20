import type { IconData } from "./types.js";

export const hardDrive: IconData = {
  name: "hard-drive",
  category: "devices",
  body: [
    [
      "path",
      {
        d: "M5.5 12h13a2.5 2.5 0 0 1 1.22.32m1.14 1.35a2.5 2.5 0 0 1 .14.83v3a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-3a2.5 2.5 0 0 1 .14-.83m1.14-1.35A2.5 2.5 0 0 1 5.5 12",
      },
    ],
    ["path", { d: "M3.5 13.5l2-6.6A2.5 2.5 0 0 1 7.9 5h8.2a2.5 2.5 0 0 1 2.4 1.9l2 6.6" }],
    ["path", { d: "M7 16h.01m3.49 0h.01", animate: true }],
  ],
  motion: "pop",
};
