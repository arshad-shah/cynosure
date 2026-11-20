import type { IconData } from "./types.js";

export const alarmClock: IconData = {
  name: "alarm-clock",
  category: "time",
  body: [
    ["circle", { cx: 12, cy: 13, r: 7 }],
    ["path", { d: "M12 9.5V13l2 1.5", animate: true }],
    ["path", { d: "M4 6.5 6.5 4M20 6.5 17.5 4M7.05 17.95 5.6 19.9m11.35-1.95 1.45 1.95" }],
  ],
  motion: "tilt",
};
