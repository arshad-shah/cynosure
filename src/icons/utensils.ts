import type { IconData } from "./types.js";

export const utensils: IconData = {
  name: "utensils",
  category: "home",
  body: [
    ["path", { d: "M5.5 3.5V8a2.5 2.5 0 0 0 5 0V3.5M8 3.5v17" }],
    ["path", { d: "M18.5 14.5H15V9c0-3 1.5-5 3.5-5.5v17", animate: true }],
  ],
  motion: "tilt",
};
