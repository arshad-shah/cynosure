import type { IconData } from "./types.js";

export const textLayer: IconData = {
  name: "text-layer",
  category: "files",
  body: [
    ["path", { d: "M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10zm0 0v5h5" }],
    ["path", { d: "M10.5 10.5h3m-1.5 0V18m-1.5 0h3", animate: true }],
  ],
  motion: "pop",
};
