import type { IconData } from "./types.js";

export const sun: IconData = {
  name: "sun",
  body: [
    ["rect", { x: 8, y: 8, width: 8, height: 8, rx: 2.5 }],
    [
      "path",
      {
        d: "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4",
        animate: true,
      },
    ],
  ],
  motion: "spin",
};
