import type { IconData } from "./types.js";

export const pageWatermark: IconData = {
  name: "page-watermark",
  category: "editing",
  body: [
    ["rect", { x: 5, y: 3.5, width: 14, height: 17, rx: 2 }],
    ["path", { d: "M12 7.5s3.5 3.7 3.5 6a3.5 3.5 0 0 1-7 0c0-2.3 3.5-6 3.5-6z", animate: true }],
  ],
  motion: "drop",
};
