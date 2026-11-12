import type { IconData } from "./types.js";

export const kaaba: IconData = {
  name: "kaaba",
  category: "faith",
  body: [
    ["path", { d: "M3.5 8.5L8 5.5h12.5v11.5L16 20.5H3.5zM3.5 8.5H16v12M16 8.5l4.5-3M11 18v-3.5h2.5V18" }],
    ["path", { d: "M3.5 11.5H16l4.5-3", animate: true }],
  ],
  motion: "draw",
};
