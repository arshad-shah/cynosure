import type { IconData } from "./types.js";

export const inbox: IconData = {
  name: "inbox",
  category: "communication",
  body: [
    [
      "path",
      {
        d: "M3 13.5l2.6-7.3A2 2 0 0 1 7.5 5h9a2 2 0 0 1 1.9 1.2l2.6 7.3v4a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z",
      },
    ],
    ["path", { d: "M3 13.5h5l1.5 2.5h5l1.5-2.5h5", animate: true }],
  ],
  motion: "drop",
};
