import type { IconData } from "./types.js";

export const fileImage: IconData = {
  name: "file-image",
  category: "files",
  body: [
    ["path", { d: "M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10zm0 0v5h5" }],
    ["circle", { cx: 9.5, cy: 12, r: 1.25, animate: true }],
    ["path", { d: "m19 17-3.5-3.5-7 7" }],
  ],
  motion: "pop",
};
