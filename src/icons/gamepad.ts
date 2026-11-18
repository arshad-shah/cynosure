import type { IconData } from "./types.js";

export const gamepad: IconData = {
  name: "gamepad",
  category: "devices",
  body: [
    [
      "path",
      {
        d: "M7 7.5h10a4 4 0 0 1 3.9 3.1l.9 4.3a2.5 2.5 0 0 1-4.3 2.2l-1.9-1.6H8.4l-1.9 1.6a2.5 2.5 0 0 1-4.3-2.2l.9-4.3A4 4 0 0 1 7 7.5",
        animate: true,
      },
    ],
    ["path", { d: "M8 10v3.5m-1.75-1.75h3.5M15.5 11h.01m1.99 2h.01" }],
  ],
  motion: "tilt",
};
