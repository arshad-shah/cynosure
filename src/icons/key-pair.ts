import type { IconData } from "./types.js";

export const keyPair: IconData = {
  name: "key-pair",
  category: "security",
  body: [
    ["rect", { x: 3.5, y: 11, width: 10, height: 9.5, rx: 2.5 }],
    ["path", { d: "M6 11V8.5a2.5 2.5 0 0 1 5 0V11" }],
    ["path", { d: "M17.5 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6v11m0-3H20m-2.5 3h3", animate: true }],
  ],
  motion: "tilt",
};
