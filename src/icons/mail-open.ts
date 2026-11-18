import type { IconData } from "./types.js";

export const mailOpen: IconData = {
  name: "mail-open",
  category: "communication",
  body: [
    ["path", { d: "M3.5 10v8A2.5 2.5 0 0 0 6 20.5h12a2.5 2.5 0 0 0 2.5-2.5v-8L12 4z" }],
    ["path", { d: "m3.5 10 8.5 6 8.5-6", animate: true }],
  ],
  motion: "lift",
};
