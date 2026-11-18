import type { IconData } from "./types.js";

export const fileAudio: IconData = {
  name: "file-audio",
  category: "files",
  body: [
    ["path", { d: "M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10zm0 0v5h5" }],
    ["path", { d: "M11 17.5V12l3.5 1", animate: true }],
    ["circle", { cx: 9.5, cy: 17.5, r: 1.5 }],
  ],
  motion: "pop",
};
