import type { IconData } from "./types.js";

export const kaaba: IconData = {
  name: "kaaba",
  category: "faith",
  body: [
    ["path", { d: "m3.5 8.5 4.5-3h12.5V17L16 20.5H3.5zm0 0H16v12m0-12 4.5-3M11 18v-3.5h2.5V18" }],
    ["path", { d: "M3.5 11.5H16l4.5-3", animate: true }],
  ],
  motion: "draw",
};
