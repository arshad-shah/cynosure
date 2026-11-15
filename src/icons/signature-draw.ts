import type { IconData } from "./types.js";

export const signatureDraw: IconData = {
  name: "signature-draw",
  category: "editing",
  body: [
    ["path", { d: "m6.5 15.5.75-3 7.5-7.5A1.6 1.6 0 0 1 17 7.25l-7.5 7.5z" }],
    [
      "path",
      {
        d: "M3.5 20c1.5-1.75 2.75-1.75 3.75 0s2.5 1.75 3.75 0 2.75-1.75 3.75 0 2.5 1 4.25-.5",
        animate: true,
      },
    ],
  ],
  motion: "draw",
};
