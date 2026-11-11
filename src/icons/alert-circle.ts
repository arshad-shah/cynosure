import type { IconData } from "./types.js";

export const alertCircle: IconData = {
  name: "alert-circle",
  category: "status",
  body: [
    ["circle", { cx: 12, cy: 12, r: 8.5 }],
    ["path", { d: "M12 8v4.5M12 16h.01", animate: true }],
  ],
  motion: "pop",
};
