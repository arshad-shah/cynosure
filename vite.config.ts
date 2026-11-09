import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Library build: one ESM module per source module so consumers tree-shake. CSS is built by tools/build-css.ts. */
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    target: "es2023",
    minify: false,
    lib: {
      formats: ["es"],
      entry: {
        index: "src/index.ts",
        "icons/index": "src/icons/index.ts",
        "styles/inline": "src/styles/inline.ts",
        "adapters/vite/index": "src/adapters/vite/index.ts",
      },
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^node:/],
      output: { preserveModules: true, preserveModulesRoot: "src", entryFileNames: "[name].js" },
    },
  },
});
