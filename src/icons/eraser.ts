import type { IconData } from "./types.js";

export const eraser: IconData = {
  name: "eraser",
  category: "design",
  body: [
    [
      "path",
      {
        d: "M14.6 4.4a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 18H7.5l-3.1-3.1a2 2 0 0 1 0-2.8z",
        animate: true,
      },
    ],
    ["path", { d: "M9.25 9.75l5 5M11 18h8.5" }],
  ],
  motion: "nudge",
};
