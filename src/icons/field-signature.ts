import type { IconData } from "./types.js";

export const fieldSignature: IconData = {
  name: "field-signature",
  category: "editing",
  body: [
    ["rect", { x: 3, y: 7, width: 18, height: 10, rx: 2.5 }],
    [
      "path",
      { d: "M6.5 13.5c1.4-2.6 2.3-2.6 2.8-1.3s1 1.8 2.3-.4 1.8-1.8 2.3 0 1.4.9 3.1-.4", animate: true },
    ],
  ],
  motion: "draw",
};
