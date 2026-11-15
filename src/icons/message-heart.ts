import type { IconData } from "./types.js";

export const messageHeart: IconData = {
  name: "message-heart",
  category: "social",
  body: [
    [
      "path",
      {
        d: "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17h-1a.5.5 0 0 1-.5-.5z",
      },
    ],
    [
      "path",
      {
        d: "M12 14s-3.5-2.1-3.5-4.7A2.1 2.1 0 0 1 12 7.9a2.1 2.1 0 0 1 3.5 1.4c0 2.6-3.5 4.7-3.5 4.7",
        animate: true,
      },
    ],
  ],
  motion: "pop",
};
