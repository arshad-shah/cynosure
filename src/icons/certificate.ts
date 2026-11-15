import type { IconData } from "./types.js";

export const certificate: IconData = {
  name: "certificate",
  category: "security",
  body: [
    ["path", { d: "M11 19.5H5.5A2.5 2.5 0 0 1 3 17V7a2.5 2.5 0 0 1 2.5-2.5h13A2.5 2.5 0 0 1 21 7v2.5" }],
    ["path", { d: "M7 9h9" }],
    ["circle", { cx: 16.5, cy: 14.5, r: 3.25, animate: true }],
    ["path", { d: "m14.75 17.25-.5 3.75 2.25-1.25L18.75 21l-.5-3.75" }],
  ],
  motion: "pop",
};
