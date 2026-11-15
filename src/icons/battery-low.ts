import type { IconData } from "./types.js";

export const batteryLow: IconData = {
  name: "battery-low",
  category: "devices",
  body: [
    ["rect", { x: 3, y: 7, width: 15.5, height: 10, rx: 2.5 }],
    ["path", { d: "M21 10.5v3" }],
    ["path", { d: "M6.5 10v4", animate: true }],
  ],
  motion: "pop",
};
