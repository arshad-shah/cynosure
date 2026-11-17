import type { IconData } from "./types.js";

export const pixelate: IconData = {
  name: "pixelate",
  category: "editing",
  body: [
    ["rect", { x: 3.5, y: 3.5, width: 17, height: 17, rx: 3 }],
    ["path", { d: "M7 7h5.5v5.5H7zm5.5 5.5H17V17h-4.5zM15 7h2v2h-2zM7 15h2v2H7z", animate: true }],
  ],
  motion: "pop",
};
