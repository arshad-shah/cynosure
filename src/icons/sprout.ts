import type { IconData } from "./types.js";

export const sprout: IconData = {
  name: "sprout",
  category: "nature",
  body: [
    ["path", { d: "M12 20.5V12M8 20.5h8" }],
    [
      "path",
      { d: "M12 12c0-3.5-2.5-5.5-6.5-5.5C5.5 10 8 12 12 12m0-1.5c0-3 2-5 6-5 0 3-2 5-6 5", animate: true },
    ],
  ],
  motion: "pop",
};
