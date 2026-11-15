import type { IconData } from "./types.js";

export const signatureVerified: IconData = {
  name: "signature-verified",
  category: "security",
  body: [
    ["path", { d: "M3 10c1.6-3.2 2.8-3.2 3.4-1.4S7.6 11 9 9" }],
    ["path", { d: "M3 13.5h5" }],
    ["circle", { cx: 15.5, cy: 14.5, r: 5.5 }],
    ["path", { d: "m13 14.75 1.75 1.75L18 13", animate: true }],
  ],
  motion: "pop",
};
