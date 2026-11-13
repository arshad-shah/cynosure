import type { IconData } from "./types.js";

export const fileSearch: IconData = {
  name: "file-search",
  category: "files",
  body: [
    [
      "path",
      { d: "M14 3.5H7A2 2 0 0 0 5 5.5v13A2 2 0 0 0 7 20.5h10a2 2 0 0 0 2-2V8.5zM14 3.5v5h5", animate: true },
    ],
    ["rect", { x: 8, y: 10.5, width: 5.5, height: 5.5, rx: 1.75 }],
    ["path", { d: "M13.5 16l2.25 2.25" }],
  ],
  motion: "lift",
};
