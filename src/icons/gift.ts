import type { IconData } from "./types.js";

export const gift: IconData = {
  name: "gift",
  category: "commerce",
  body: [
    ["rect", { x: 3.5, y: 8, width: 17, height: 4, rx: 1.5 }],
    ["path", { d: "M5 12v6.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V12M12 8v12.5" }],
    [
      "path",
      {
        d: "M12 8c-1.2-3-2.4-4.5-4-4.5A2.25 2.25 0 0 0 8 8zm0 0c1.2-3 2.4-4.5 4-4.5A2.25 2.25 0 0 1 16 8z",
        animate: true,
      },
    ],
  ],
  motion: "pop",
};
