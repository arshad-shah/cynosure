import type { IconData } from "./types.js";

export const discount: IconData = {
  name: "discount",
  category: "commerce",
  body: [
    [
      "path",
      {
        d: "M12 4a3.83 3.83 0 0 1 5.66 2.34A3.83 3.83 0 0 1 20 12a3.83 3.83 0 0 1-2.34 5.66A3.83 3.83 0 0 1 12 20a3.83 3.83 0 0 1-5.66-2.34A3.83 3.83 0 0 1 4 12a3.83 3.83 0 0 1 2.34-5.66A3.83 3.83 0 0 1 12 4",
        animate: true,
      },
    ],
    ["circle", { cx: 9.25, cy: 9.25, r: 1 }],
    ["circle", { cx: 14.75, cy: 14.75, r: 1 }],
    ["path", { d: "m15 9-6 6" }],
  ],
  motion: "rotate",
};
