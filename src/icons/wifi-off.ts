import type { IconData } from "./types.js";

export const wifiOff: IconData = {
  name: "wifi-off",
  category: "devices",
  body: [
    [
      "path",
      {
        d: "M5 12.5a10 10 0 0 1 2.29-1.68m5.97-1.1A10 10 0 0 1 19 12.5m-11 3a5.5 5.5 0 0 1 2.46-1.5M12 19h.01M2 9.5a14.5 14.5 0 0 1 2.23-1.74m5.06-2A14.5 14.5 0 0 1 22 9.5",
      },
    ],
    ["path", { d: "M3.5 3.5l17 17", animate: true }],
  ],
  motion: "pop",
};
