import type { IconData } from "./types.js";

export const settings: IconData = {
  name: "settings",
  category: "actions",
  body: [
    [
      "path",
      {
        d: "M12 2.75l1.6 2.1 2.6-.4.9 2.5 2.5.9-.4 2.6 2.1 1.55-2.1 1.6.4 2.6-2.5.9-.9 2.5-2.6-.4L12 21.25l-1.6-2.1-2.6.4-.9-2.5-2.5-.9.4-2.6L2.75 12l2.1-1.6-.4-2.6 2.5-.9.9-2.5 2.6.4z",
        animate: true,
      },
    ],
    ["circle", { cx: 12, cy: 12, r: 3 }],
  ],
  motion: "rotate",
};
