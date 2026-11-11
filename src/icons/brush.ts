import type { IconData } from "./types.js";

export const brush: IconData = {
  name: "brush",
  category: "design",
  body: [
    ["path", { d: "M18.5 3.5a2 2 0 0 1 2.8 2.8l-8.3 8.3-2.8-2.8z", animate: true }],
    [
      "path",
      {
        d: "M10.2 11.8c-2.5-.5-4.7 1-5 3.7-.2 1.8-.9 3-2.2 3.5 3.6 1.3 7.6.4 8.7-2.8.4-1.3.3-2.7-1.5-4.4z",
      },
    ],
  ],
  motion: "tilt",
};
