import type { IconData } from "./types.js";

export const ocrScan: IconData = {
  name: "ocr-scan",
  category: "actions",
  body: [
    [
      "path",
      {
        d: "M4 8V6.5A2.5 2.5 0 0 1 6.5 4H8m8 0h1.5A2.5 2.5 0 0 1 20 6.5V8m0 8v1.5a2.5 2.5 0 0 1-2.5 2.5H16m-8 0H6.5A2.5 2.5 0 0 1 4 17.5V16",
        animate: true,
      },
    ],
    ["path", { d: "M8 9h8m-8 3h8m-8 3h5" }],
  ],
  motion: "pop",
};
