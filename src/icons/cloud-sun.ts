import type { IconData } from "./types.js";

export const cloudSun: IconData = {
  name: "cloud-sun",
  category: "nature",
  body: [
    [
      "path",
      { d: "M10.45 18.18a3.38 3.38 0 0 1-.38-6.75 4.5 4.5 0 0 1 8.71 1.19 2.85 2.85 0 0 1-.46 5.56z" },
    ],
    ["path", { d: "M12.1 8.6a3.5 3.5 0 1 0-4.4 3.7" }],
    [
      "path",
      { d: "M9 2.5V4M3 8.5h1.5m.25-4.25 1.06 1.06m7.44-1.06-1.06 1.06m-7.44 7.44 1.06-1.06", animate: true },
    ],
  ],
  motion: "spin",
};
