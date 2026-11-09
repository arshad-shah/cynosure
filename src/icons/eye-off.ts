import type { IconData } from "./types.js";

export const eyeOff: IconData = {
  name: "eye-off",
  category: "actions",
  body: [
    ["path", { d: "M3 3l18 18", animate: true }],
    [
      "path",
      {
        d: "M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.5M6.6 6.6C4 8.3 2.5 12 2.5 12s3.5 6.5 9.5 6.5a9 9 0 0 0 4.4-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2",
      },
    ],
  ],
  motion: "pop",
};
