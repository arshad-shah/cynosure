import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import config from "./docs.config.ts";
import { docs } from "./engine/build/plugin.ts";

// The site is a Vite app: `pnpm dev` serves it; `pnpm build` (engine/build/build.ts) also writes every page as HTML.
export default defineConfig({
  plugins: [docs(config, import.meta.dirname), react()],
  // Component names are kept in the built code: an example's code is written from the components it renders.
  build: { target: "es2022", outDir: "dist", rolldownOptions: { output: { keepNames: true } } },
  server: { fs: { allow: [".."] } },
});
