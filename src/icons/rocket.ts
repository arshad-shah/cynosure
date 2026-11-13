import type { IconData } from "./types.js";

export const rocket: IconData = {
  name: "rocket",
  category: "actions",
  body: [
    [
      "path",
      {
        d: "M12 16l-4-4A11 11 0 0 1 19 5 11 11 0 0 1 12 16zM10.2 8.5L4.5 10.3 8 12M15.5 13.8l-1.8 5.7L12 16",
        animate: true,
      },
    ],
    ["path", { d: "M15.3 8.7h.01", animate: true }],
    ["path", { d: "M7.75 16.25L5 19" }],
  ],
  motion: "lift",
};
