import type { IconData } from "./types.js";

export const signatureInitials: IconData = {
  name: "signature-initials",
  category: "editing",
  body: [
    [
      "path",
      {
        d: "m3.5 16.5 3.5-9 3.5 9M5 13h4m4.5 3.5v-9h3.25a2.25 2.25 0 0 1 0 4.5H13.5h3.75a2.25 2.25 0 0 1 0 4.5z",
        animate: true,
      },
    ],
    ["path", { d: "M3.5 20h16" }],
  ],
  motion: "draw",
};
