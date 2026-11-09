import type { IconData } from "./types.js";

export const help: IconData = {
  name: "help",
  category: "status",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M9.7 9.5a2.4 2.4 0 0 1 4.6.8c0 1.7-2.3 2.2-2.3 3.4M12 17h.01", animate: true }],
  ],
  motion: "pop",
};
