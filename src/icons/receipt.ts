import type { IconData } from "./types.js";

export const receipt: IconData = {
  name: "receipt",
  category: "commerce",
  body: [
    ["path", { d: "M5.5 20.5v-15a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v15L16.3 19l-2.1 1.5L12 19l-2.2 1.5L7.7 19z" }],
    ["path", { d: "M9 8h6m-6 3.5h6M9 15h3", animate: true }],
  ],
  motion: "draw",
};
