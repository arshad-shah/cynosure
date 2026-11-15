import type { IconData } from "./types.js";

export const signatureUnknown: IconData = {
  name: "signature-unknown",
  category: "security",
  body: [
    ["circle", { cx: 12, cy: 10, r: 6.5 }],
    ["path", { d: "M9.9 8.4a2.2 2.2 0 1 1 3.2 1.95c-.65.35-1.1.8-1.1 1.45M12 14h.01", animate: true }],
    ["path", { d: "M4.5 20.5c1.3-1.8 2.3-1.8 2.8-.5s1.2 1.5 2.5-.2 2.1-1.5 2.9 0 1.5 1 3.3.2" }],
  ],
  motion: "pop",
};
