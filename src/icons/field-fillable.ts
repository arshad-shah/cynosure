import type { IconData } from "./types.js";

export const fieldFillable: IconData = {
  name: "field-fillable",
  category: "editing",
  body: [
    ["path", { d: "M7.5 7h-2A2.5 2.5 0 0 0 3 9.5v.5m0 4v.5A2.5 2.5 0 0 0 5.5 17h2" }],
    ["path", { d: "M11 7h7.5A2.5 2.5 0 0 1 21 9.5v5a2.5 2.5 0 0 1-2.5 2.5H11" }],
    ["path", { d: "M16 9.75v4.5M13.75 12h4.5", animate: true }],
  ],
  motion: "pop",
};
