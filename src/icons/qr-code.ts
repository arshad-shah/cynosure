import type { IconData } from "./types.js";

export const qrCode: IconData = {
  name: "qr-code",
  category: "data",
  body: [
    ["rect", { x: 3.5, y: 3.5, width: 7, height: 7, rx: 2 }],
    ["rect", { x: 13.5, y: 3.5, width: 7, height: 7, rx: 2 }],
    ["rect", { x: 3.5, y: 13.5, width: 7, height: 7, rx: 2 }],
    ["path", { d: "M7 7h.01M17 7h.01M7 17h.01" }],
    ["path", { d: "M13.5 13.5h3.5M20.5 13.5V17M13.5 17v3.5M17 17h.01M17 20.5h3.5", animate: true }],
  ],
  motion: "pop",
};
