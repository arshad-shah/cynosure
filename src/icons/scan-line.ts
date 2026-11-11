import type { IconData } from "./types.js";

export const scanLine: IconData = {
  name: "scan-line",
  category: "actions",
  body: [
    [
      "path",
      {
        d: "M4 8V6.5A2.5 2.5 0 0 1 6.5 4H8M16 4h1.5A2.5 2.5 0 0 1 20 6.5V8M20 16v1.5a2.5 2.5 0 0 1-2.5 2.5H16M8 20H6.5A2.5 2.5 0 0 1 4 17.5V16",
      },
    ],
    ["path", { d: "M7 12h10", animate: true }],
  ],
  motion: "slide",
};
