import type { IconData } from "./types.js";

export const strikethrough: IconData = {
  name: "strikethrough",
  category: "editing",
  body: [
    [
      "path",
      {
        d: "M16.5 6.5A4 4 0 0 0 13 5h-2a3.5 3.5 0 0 0-1.8 6.5M8 17.5A4 4 0 0 0 11.5 19h1.5a3.5 3.5 0 0 0 3-5",
      },
    ],
    ["path", { d: "M4 12h16", animate: true }],
  ],
  motion: "slide",
};
