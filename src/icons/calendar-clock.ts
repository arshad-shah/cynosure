import type { IconData } from "./types.js";

export const calendarClock: IconData = {
  name: "calendar-clock",
  category: "time",
  body: [
    [
      "path",
      { d: "M20.5 11V8a3 3 0 0 0-3-3h-11a3 3 0 0 0-3 3v9.5a3 3 0 0 0 3 3H11M3.5 10h17M8 3.5v3m8-3v3" },
    ],
    ["circle", { cx: 17, cy: 17, r: 4 }],
    ["path", { d: "M17 15.25V17l1.25 1", animate: true }],
  ],
  motion: "rotate",
};
