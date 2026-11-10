import type { IconData } from "./types.js";

export const gif: IconData = {
  name: "gif",
  category: "media",
  body: [
    ["rect", { x: 3, y: 5, width: 18, height: 14, rx: 3 }],
    [
      "path",
      {
        d: "M10 10H8.2a1.5 1.5 0 0 0-1.5 1.5v1A1.5 1.5 0 0 0 8.2 14H10v-2H8.8M12.5 10v4M15.5 14v-4h2.5M15.5 12h2",
      },
    ],
  ],
};
