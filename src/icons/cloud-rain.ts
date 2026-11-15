import type { IconData } from "./types.js";

export const cloudRain: IconData = {
  name: "cloud-rain",
  category: "nature",
  body: [
    ["path", { d: "M8 14.3a3.6 3.6 0 0 1-.4-7.2 4.8 4.8 0 0 1 9.28 1.28 3.04 3.04 0 0 1-.48 5.92z" }],
    ["path", { d: "M8.5 17.5v3m3.5-3v3m3.5-3v3", animate: true }],
  ],
  motion: "drop",
};
