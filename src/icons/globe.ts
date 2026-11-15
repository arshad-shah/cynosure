import type { IconData } from "./types.js";

export const globe: IconData = {
  name: "globe",
  category: "data",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    [
      "path",
      {
        d: "M3.5 12h17M12 3.5C14.5 6 15.5 9 15.5 12s-1 6-3.5 8.5C9.5 18 8.5 15 8.5 12s1-6 3.5-8.5",
        animate: true,
      },
    ],
  ],
  motion: "spin",
};
