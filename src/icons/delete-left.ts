import type { IconData } from "./types.js";

export const deleteLeft: IconData = {
  name: "delete-left",
  category: "editing",
  body: [
    [
      "path",
      {
        d: "M9.5 5.5h9A2.5 2.5 0 0 1 21 8v8a2.5 2.5 0 0 1-2.5 2.5h-9a2 2 0 0 1-1.5-.7L3 12l5-5.8a2 2 0 0 1 1.5-.7",
      },
    ],
    ["path", { d: "m11.5 9.5 5 5m0-5-5 5", animate: true }],
  ],
  motion: "rotate",
};
