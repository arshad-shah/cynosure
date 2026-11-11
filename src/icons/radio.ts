import type { IconData } from "./types.js";

export const radio: IconData = {
  name: "radio",
  category: "communication",
  body: [
    ["circle", { cx: 12, cy: 12, r: 2 }],
    [
      "path",
      {
        d: "M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8",
      },
    ],
  ],
};
