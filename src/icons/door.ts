import type { IconData } from "./types.js";

export const door: IconData = {
  name: "door",
  category: "home",
  body: [
    ["path", { d: "M3.5 20.5h17" }],
    ["path", { d: "M6 20.5v-15a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15M14.5 12h.01", animate: true }],
  ],
  motion: "flip",
};
