import type { IconData } from "./types.js";

export const signatureBroken: IconData = {
  name: "signature-broken",
  category: "security",
  body: [
    ["path", { d: "M3 10c1.6-3.2 2.8-3.2 3.4-1.4S7.6 11 9 9" }],
    ["path", { d: "M3 13.5h5" }],
    ["circle", { cx: 15.5, cy: 14.5, r: 5.5 }],
    ["path", { d: "M13.5 12.5l4 4m0-4-4 4", animate: true }],
  ],
  motion: "rotate",
};
