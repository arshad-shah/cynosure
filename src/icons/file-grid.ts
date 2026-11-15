import type { IconData } from "./types.js";

export const fileGrid: IconData = {
  name: "file-grid",
  category: "files",
  body: [
    ["path", { d: "M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10zm0 0v5h5" }],
    ["rect", { x: 8, y: 10.5, width: 8, height: 7.5, rx: 1.5, animate: true }],
    ["path", { d: "M12 10.5V18m-4-3.75h8" }],
  ],
  motion: "pop",
};
