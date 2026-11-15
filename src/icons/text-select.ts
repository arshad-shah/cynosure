import type { IconData } from "./types.js";

export const textSelect: IconData = {
  name: "text-select",
  category: "editing",
  body: [
    [
      "path",
      {
        d: "M4 7.5v-2A1.5 1.5 0 0 1 5.5 4h2m9 0h2A1.5 1.5 0 0 1 20 5.5v2m0 9v2a1.5 1.5 0 0 1-1.5 1.5h-2m-9 0h-2A1.5 1.5 0 0 1 4 18.5v-2M10.5 4h3m-3 16h3M4 10.5v3m16-3v3",
      },
    ],
    ["path", { d: "M8.5 10h7m-7 4H13", animate: true }],
  ],
  motion: "draw",
};
