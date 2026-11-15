import type { IconData } from "./types.js";

export const folderPlus: IconData = {
  name: "folder-plus",
  category: "files",
  body: [
    [
      "path",
      {
        d: "M3.5 7.5a2 2 0 0 1 2-2H10L12 8h6.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z",
        animate: true,
      },
    ],
    ["path", { d: "M12 11v6m-3-3h6" }],
  ],
  motion: "lift",
};
