import type { IconData } from "./types.js";

export const crescent: IconData = {
  name: "crescent",
  category: "faith",
  body: [
    ["path", { d: "M10.1 5.05A8 8 0 1 0 18.25 16.4A7 7 0 0 1 10.1 5.05z" }],
    [
      "path",
      { d: "M18 5l.9 2.3 2.45.1-1.9 1.55.6 2.4L18 10l-2.05 1.35.6-2.4-1.9-1.55 2.45-.1z", animate: true },
    ],
  ],
  motion: "pop",
};
