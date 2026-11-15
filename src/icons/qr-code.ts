import type { IconData } from "./types.js";

export const qrCode: IconData = {
  name: "qr-code",
  category: "data",
  body: [
    ["rect", { x: 3.5, y: 3.5, width: 7, height: 7, rx: 2 }],
    ["rect", { x: 13.5, y: 3.5, width: 7, height: 7, rx: 2 }],
    ["rect", { x: 3.5, y: 13.5, width: 7, height: 7, rx: 2 }],
    ["path", { d: "M7 7h.01M17 7h.01M7 17h.01" }],
    ["circle", { cx: 14.5, cy: 14.5, r: 0.75, animate: true }],
    ["circle", { cx: 19.5, cy: 19.5, r: 0.75, animate: true }],
    ["circle", { cx: 14.5, cy: 19.5, r: 0.75, animate: true }],
  ],
  motion: "pop",
};
