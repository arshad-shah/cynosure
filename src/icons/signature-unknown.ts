import type { IconData } from "./types.js";

export const signatureUnknown: IconData = {
  name: "signature-unknown",
  category: "security",
  body: [
    ["path", { d: "M3 10c1.6-3.2 2.8-3.2 3.4-1.4S7.6 11 9 9" }],
    ["path", { d: "M3 13.5h5" }],
    ["circle", { cx: 15.5, cy: 14.5, r: 5.5 }],
    ["path", { d: "M13.75 12.9a1.75 1.75 0 1 1 2.5 1.6c-.5.25-.75.6-.75 1.15m0 1.75h.01", animate: true }],
  ],
  motion: "pop",
};
