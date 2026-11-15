import type { IconData } from "./types.js";

export const eyeOff: IconData = {
  name: "eye-off",
  category: "actions",
  body: [
    ["path", { d: "M3 3l18 18", animate: true }],
    [
      "path",
      {
        d: "M10.6 5.6a9.6 9.6 0 0 1 1.4-.1c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.5M6.6 6.6C4 8.3 2.5 12 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.4-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2",
      },
    ],
  ],
  motion: "pop",
};
