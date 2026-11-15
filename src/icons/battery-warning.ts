import type { IconData } from "./types.js";

export const batteryWarning: IconData = {
  name: "battery-warning",
  category: "devices",
  body: [
    ["rect", { x: 3, y: 7, width: 15.5, height: 10, rx: 2.5 }],
    ["path", { d: "M21 10.5v3" }],
    ["path", { d: "M10.75 9.75v2.5m0 2.25h.01", animate: true }],
  ],
  motion: "pop",
};
