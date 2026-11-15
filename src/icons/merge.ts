import type { IconData } from "./types.js";

export const merge: IconData = {
  name: "merge",
  category: "arrows",
  body: [
    ["path", { d: "M6.5 4v2.5c0 2.2 1 3.6 2.6 5L12 14v6M17.5 4v2.5c0 2.2-1 3.6-2.6 5L12 14" }],
    ["path", { d: "M9.25 17.25 12 20l2.75-2.75", animate: true }],
  ],
  motion: "drop",
};
