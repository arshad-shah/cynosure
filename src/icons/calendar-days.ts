import type { IconData } from "./types.js";

export const calendarDays: IconData = {
  name: "calendar-days",
  category: "time",
  body: [
    ["rect", { x: 3.5, y: 5, width: 17, height: 15.5, rx: 3 }],
    ["path", { d: "M3.5 10h17M8 3.5v3m8-3v3" }],
    ["path", { d: "M8 13.5h.01m8 0h.01M8 17h.01m8 0h.01", animate: true }],
  ],
  motion: "pop",
};
