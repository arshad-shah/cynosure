import type { IconData } from "./types.js";

export const calendarCheck: IconData = {
  name: "calendar-check",
  category: "time",
  body: [
    ["rect", { x: 3.5, y: 5, width: 17, height: 15.5, rx: 3 }],
    ["path", { d: "M3.5 10h17M8 3.5v3m8-3v3" }],
    ["path", { d: "m9 15 2 2 4-4", animate: true }],
  ],
  motion: "pop",
};
