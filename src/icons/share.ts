import type { IconData } from "./types.js";

export const share: IconData = {
  name: "share",
  category: "actions",
  body: [
    ["circle", { cx: 18, cy: 5.5, r: 2.5, animate: true }],
    ["circle", { cx: 6, cy: 12, r: 2.5 }],
    ["circle", { cx: 18, cy: 18.5, r: 2.5 }],
    ["path", { d: "M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" }],
  ],
  motion: "pop",
};
