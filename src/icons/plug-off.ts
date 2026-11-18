import type { IconData } from "./types.js";

export const plugOff: IconData = {
  name: "plug-off",
  category: "devices",
  body: [
    [
      "path",
      {
        d: "M9 3v2.46M15 3v4m-4.46 0h6.96v3a5.5 5.5 0 0 1-.92 3.04m-4.62 2.46a5.5 5.5 0 0 1-5.46-5.46m5.5 5.5V21",
      },
    ],
    ["path", { d: "M3.5 3.5l17 17", animate: true }],
  ],
  motion: "pop",
};
