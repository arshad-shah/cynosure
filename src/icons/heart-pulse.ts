import type { IconData } from "./types.js";

export const heartPulse: IconData = {
  name: "heart-pulse",
  category: "health",
  body: [
    ["path", { d: "M12 20s-7.5-4.5-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.5-7.5 10-7.5 10" }],
    ["path", { d: "M7.5 12.5h2L11 10l2 4.5 1.5-2h2", animate: true }],
  ],
  motion: "draw",
};
