import type { IconData } from "./types.js";

export const batteryCharging: IconData = {
  name: "battery-charging",
  category: "devices",
  body: [
    ["rect", { x: 3, y: 7, width: 15.5, height: 10, rx: 2.5 }],
    ["path", { d: "M21 10.5v3" }],
    ["path", { d: "m11.5 9-2 3h3l-2 3", animate: true }],
  ],
  motion: "pop",
};
