import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Every React import, from the library source too, resolves to this fixture's React 18. */
const react18 = (path: string) => fileURLToPath(new URL(`./node_modules/${path}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^react$/, replacement: react18("react/index.js") },
      { find: /^react\/jsx-runtime$/, replacement: react18("react/jsx-runtime.js") },
      { find: /^react\/jsx-dev-runtime$/, replacement: react18("react/jsx-dev-runtime.js") },
      { find: /^react-dom$/, replacement: react18("react-dom/index.js") },
      { find: /^react-dom\/client$/, replacement: react18("react-dom/client.js") },
      { find: /^react-dom\/server$/, replacement: react18("react-dom/server.node.js") },
      { find: /^react-dom\/test-utils$/, replacement: react18("react-dom/test-utils.js") },
    ],
  },
  test: { include: ["*.test.tsx"], environment: "jsdom" },
});
