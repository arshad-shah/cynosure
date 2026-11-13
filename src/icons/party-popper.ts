import type { IconData } from "./types.js";

export const partyPopper: IconData = {
  name: "party-popper",
  category: "status",
  body: [
    ["path", { d: "M4.5 19.5L8 9l7 7z" }],
    [
      "path",
      {
        d: "M12.5 11.5L18 6M11 7.5c.75-1.25.5-2.75-.75-3.75M16.5 13c1.25-.75 2.75-.5 3.75.75M15.5 3.5h.01M20.5 9.5h.01M19.5 3.5h.01",
        animate: true,
      },
    ],
  ],
  motion: "pop",
};
