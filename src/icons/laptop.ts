import type { IconData } from "./types.js";

export const laptop: IconData = {
  name: "laptop",
  category: "devices",
  body: [
    ["rect", { x: 5, y: 5, width: 14, height: 10, rx: 1.5, animate: true }],
    ["path", { d: "M2.5 19h19" }],
  ],
  motion: "lift",
};
