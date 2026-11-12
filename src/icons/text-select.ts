import type { IconData } from "./types.js";

export const textSelect: IconData = {
  name: "text-select",
  category: "editing",
  body: [
    [
      "path",
      {
        d: "M4 7.5v-2A1.5 1.5 0 0 1 5.5 4h2M16.5 4h2A1.5 1.5 0 0 1 20 5.5v2M20 16.5v2a1.5 1.5 0 0 1-1.5 1.5h-2M7.5 20h-2A1.5 1.5 0 0 1 4 18.5v-2M10.5 4h3M10.5 20h3M4 10.5v3M20 10.5v3",
      },
    ],
    ["path", { d: "M8.5 10h7M8.5 14h4.5", animate: true }],
  ],
  motion: "draw",
};
