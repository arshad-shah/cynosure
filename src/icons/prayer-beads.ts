import type { IconData } from "./types.js";

export const prayerBeads: IconData = {
  name: "prayer-beads",
  category: "faith",
  body: [
    ["circle", { cx: 8.35, cy: 14.3, r: 0.5 }],
    ["circle", { cx: 6.05, cy: 11.2, r: 0.5 }],
    ["circle", { cx: 6.05, cy: 7.3, r: 0.5 }],
    ["circle", { cx: 8.35, cy: 4.2, r: 0.5 }],
    ["circle", { cx: 12, cy: 3, r: 0.5 }],
    ["circle", { cx: 15.65, cy: 4.2, r: 0.5 }],
    ["circle", { cx: 17.95, cy: 7.3, r: 0.5 }],
    ["circle", { cx: 17.95, cy: 11.2, r: 0.5 }],
    ["circle", { cx: 15.65, cy: 14.3, r: 0.5 }],
    ["circle", { cx: 12, cy: 16, r: 1.5, animate: true }],
    ["path", { d: "M12 17.5V21", animate: true }],
  ],
  motion: "nudge",
};
