import type { IconData } from "./types.js";

export const sun: IconData = {
  name: "sun",
  category: "design",
  body: [
    ["rect", { x: 8, y: 8, width: 8, height: 8, rx: 2.5 }],
    [
      "path",
      {
        d: "M12 3v2m0 14v2m-9-9h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m-12.8 0L7 17M17 7l1.4-1.4",
        animate: true,
      },
    ],
  ],
  motion: "spin",
};
