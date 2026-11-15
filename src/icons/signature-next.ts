import type { IconData } from "./types.js";

export const signatureNext: IconData = {
  name: "signature-next",
  category: "editing",
  body: [
    ["path", { d: "M3.5 13.5c1.2-2.5 2.2-2.8 2.7-1.4s1 1.9 2-.3 1.6-2.2 2.1-.3" }],
    ["path", { d: "M3.5 17.5h8" }],
    ["path", { d: "M15 12h5.5M18 9.5l2.5 2.5-2.5 2.5", animate: true }],
  ],
  motion: "nudge",
};
