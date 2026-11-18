import type { IconData } from "./types.js";

export const plugOff: IconData = {
  name: "plug-off",
  category: "devices",
  body: [
    [
      "path",
      { d: "M9 3v2.5M15 3v4m-4.5 0h7v3a5.5 5.5 0 0 1-1.2 3.4m-2.4 1.7A5.5 5.5 0 0 1 6.5 10V8.5m5.5 7V21" },
    ],
    ["path", { d: "M3.5 3.5l17 17", animate: true }],
  ],
  motion: "pop",
};
