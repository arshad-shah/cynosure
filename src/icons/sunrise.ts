import type { IconData } from "./types.js";

export const sunrise: IconData = {
  name: "sunrise",
  category: "nature",
  body: [
    ["path", { d: "M3 18.5h18" }],
    [
      "path",
      { d: "M6.5 18.5a5.5 5.5 0 0 1 11 0m-5.5-8v-3m-5.65 5.35-1.8-1.8m13.1 1.8 1.8-1.8", animate: true },
    ],
  ],
  motion: "lift",
};
