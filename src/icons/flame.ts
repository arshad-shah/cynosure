import type { IconData } from "./types.js";

export const flame: IconData = {
  name: "flame",
  category: "status",
  body: [
    [
      "path",
      {
        d: "M12 20.5A6.5 6.5 0 0 1 5.5 14c0-2.6 1.4-4.4 3-5.8.3 1.6 1 2.6 2 3.2-.2-3.2 1.2-5.9 4-7.9.5 3.2 4 5.5 4 10.5a6.5 6.5 0 0 1-6.5 6.5z",
        animate: true,
      },
    ],
    ["path", { d: "M9.5 17.75c0-1.6 1.2-2.6 2.5-3.75 1.3 1.15 2.5 2.15 2.5 3.75" }],
  ],
  motion: "tilt",
};
