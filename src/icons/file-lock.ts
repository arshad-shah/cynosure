import type { IconData } from "./types.js";

export const fileLock: IconData = {
  name: "file-lock",
  category: "security",
  body: [
    ["path", { d: "M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10zm0 0v5h5" }],
    ["rect", { x: 9, y: 14, width: 6, height: 4.5, rx: 1.25 }],
    ["path", { d: "M10.25 14v-1a1.75 1.75 0 0 1 3.5 0v1", animate: true }],
  ],
  motion: "lift",
};
