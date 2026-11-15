import type { IconData } from "./types.js";

export const radar: IconData = {
  name: "radar",
  category: "data",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "m12 12 5.5-5.5m-5.5 1a4.5 4.5 0 1 0 4.5 4.5m-1 3h.01" }],
  ],
};
