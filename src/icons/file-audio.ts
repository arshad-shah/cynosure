import type { IconData } from "./types.js";

export const fileAudio: IconData = {
  name: "file-audio",
  category: "files",
  body: [
    ["path", { d: "M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10zm0 0v5h5" }],
    ["circle", { cx: 11, cy: 16.25, r: 1.75 }],
    ["path", { d: "M12.75 16.25V10.5l2.5 1", animate: true }],
  ],
  motion: "pop",
};
