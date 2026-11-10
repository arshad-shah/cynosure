import type { IconData } from "./types.js";

export const messagePlus: IconData = {
  name: "message-plus",
  category: "communication",
  body: [
    [
      "path",
      {
        d: "M20 14.5a2.5 2.5 0 0 1-2.5 2.5H9l-5 3.5V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5z",
      },
    ],
    ["path", { d: "M12 7.5v6M9 10.5h6", animate: true }],
  ],
  motion: "pop",
};
