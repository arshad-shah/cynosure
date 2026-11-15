import type { IconData } from "./types.js";

export const prayerBeads: IconData = {
  name: "prayer-beads",
  category: "faith",
  body: [
    ["circle", { cx: 7.82, cy: 14.48, r: 0.75 }],
    ["circle", { cx: 5.51, cy: 9.84, r: 0.75 }],
    ["circle", { cx: 7.25, cy: 5.07, r: 0.75 }],
    ["circle", { cx: 12, cy: 3, r: 0.75 }],
    ["circle", { cx: 16.75, cy: 5.07, r: 0.75 }],
    ["circle", { cx: 18.49, cy: 9.84, r: 0.75 }],
    ["circle", { cx: 16.18, cy: 14.48, r: 0.75 }],
    ["circle", { cx: 12, cy: 16.5, r: 1.25, animate: true }],
    ["path", { d: "M12 17.75V21", animate: true }],
  ],
  motion: "nudge",
};
