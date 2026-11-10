import type { IconData } from "./types.js";

export const listChecks: IconData = {
  name: "list-checks",
  category: "data",
  body: [
    ["path", { d: "M11 6h9M11 12h9M11 18h9" }],
    [
      "path",
      {
        d: "M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17",
        animate: true,
      },
    ],
  ],
  motion: "draw",
};
