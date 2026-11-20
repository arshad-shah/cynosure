import type { IconData } from "./types.js";

export const pictureInPicture: IconData = {
  name: "picture-in-picture",
  category: "media",
  body: [
    ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }],
    ["rect", { x: 12, y: 12, width: 5.5, height: 4.5, rx: 1.25, animate: true }],
  ],
  motion: "pop",
};
