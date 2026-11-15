import type { IconData } from "./types.js";

export const strikethrough: IconData = {
  name: "strikethrough",
  category: "editing",
  body: [
    [
      "path",
      {
        d: "M16.5 6.5A4 4 0 0 0 13 5h-2a3.5 3.5 0 0 0-1.8 6.5m-1.2 6a4 4 0 0 0 3.5 1.5H13a3.5 3.5 0 0 0 3-5",
      },
    ],
    ["path", { d: "M4 12h16", animate: true }],
  ],
  motion: "slide",
};
