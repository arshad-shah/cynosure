import type { IconData } from "./types.js";

export const paintBucket: IconData = {
  name: "paint-bucket",
  category: "design",
  body: [
    [
      "path",
      {
        d: "M11 3.5l8.5 8.5-6.6 6.6a2 2 0 0 1-2.8 0l-5.7-5.7a2 2 0 0 1 0-2.8zM4.5 12.5h13.6",
        animate: true,
      },
    ],
    ["path", { d: "M20.5 15.5s1.5 2 1.5 3a1.5 1.5 0 0 1-3 0c0-1 1.5-3 1.5-3z" }],
  ],
  motion: "tilt",
};
