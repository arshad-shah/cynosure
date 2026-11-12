import type { IconData } from "./types.js";

export const mosque: IconData = {
  name: "mosque",
  category: "faith",
  body: [
    [
      "path",
      { d: "M2.5 20.5h19M6.5 20.5v-7h11v7M10.5 20.5V18a1.5 1.5 0 0 1 3 0v2.5M3.5 20.5V7.5M20.5 20.5V7.5" },
    ],
    ["path", { d: "M7 13.5C7 10 12 9.5 12 6c0 3.5 5 4 5 7.5M12 6V3.5", animate: true }],
  ],
  motion: "lift",
};
