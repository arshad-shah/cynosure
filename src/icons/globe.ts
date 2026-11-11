import type { IconData } from "./types.js";

export const globe: IconData = {
  name: "globe",
  category: "data",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    [
      "path",
      {
        d: "M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z",
        animate: true,
      },
    ],
  ],
  motion: "spin",
};
