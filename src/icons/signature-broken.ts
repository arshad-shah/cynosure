import type { IconData } from "./types.js";

export const signatureBroken: IconData = {
  name: "signature-broken",
  category: "security",
  body: [
    ["circle", { cx: 12, cy: 10, r: 6.5 }],
    ["path", { d: "M9.75 7.75l4.5 4.5m0-4.5-4.5 4.5", animate: true }],
    ["path", { d: "M4.5 20.5c1.3-1.8 2.3-1.8 2.8-.5s1.2 1.5 2.5-.2 2.1-1.5 2.9 0 1.5 1 3.3.2" }],
  ],
  motion: "rotate",
};
