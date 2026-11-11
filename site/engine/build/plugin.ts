/**
 * The Vite plugin that serves the scanned site to the app as modules:
 *
 * - `virtual:docs/site`      what every page needs (product, navigation, page list)
 * - `virtual:docs/pages`     a loader per route, so each page's data is its own small file
 * - `virtual:docs/page/<id>` one page's data
 * - `virtual:docs/search`    the search index, loaded when search is first opened
 * - `virtual:docs/examples`  a loader per component's stories file
 *
 * In development it re-scans when a source file changes and reloads the page.
 */
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import type { DocsConfig } from "../config.ts";
import { type Scanned, scan } from "./scan.ts";

const PREFIX = "virtual:docs/";
const RESOLVED = "\0virtual:docs/";

export function docs(config: DocsConfig, siteDir: string): Plugin {
  let scanned: Promise<Scanned> | undefined;
  const get = () => {
    scanned ??= scan(config, siteDir);
    return scanned;
  };
  const stub = fileURLToPath(new URL("../app/story-stubs.ts", import.meta.url));
  return {
    name: "cynosure-docs",
    enforce: "pre",
    config: () => ({
      resolve: {
        // Stories are rendered, never run as tests: their test helpers resolve to inert stand-ins.
        alias: [{ find: /^storybook\/test$/, replacement: stub }],
        // The stories import the library's source, which must share the site's one copy of React.
        dedupe: ["react", "react-dom"],
      },
    }),
    resolveId(id) {
      if (id.startsWith(PREFIX)) return RESOLVED + id.slice(PREFIX.length);
      return undefined;
    },
    async load(id, options) {
      if (!id.startsWith(RESOLVED)) return undefined;
      const name = id.slice(RESOLVED.length);
      // Examples run in the browser only; the HTML build has no use for the stories.
      if (name === "examples" && options?.ssr) return "export default {};";
      const data = await get();
      for (const file of data.files) this.addWatchFile(file);
      if (name === "site") return `export default ${JSON.stringify(data.site)};`;
      if (name === "search") return `export default ${JSON.stringify(data.search)};`;
      if (name === "pages")
        return `export default {${data.pages
          .map(
            (page) =>
              `${JSON.stringify(page.route)}: () => import(${JSON.stringify(`${PREFIX}page/${page.id}`)})`,
          )
          .join(",")}};`;
      if (name === "examples")
        return `export default {${Object.entries(data.stories)
          .map(([key, file]) => `${JSON.stringify(key)}: () => import(${JSON.stringify(file)})`)
          .join(",")}};`;
      if (name.startsWith("page/")) {
        const page = data.pages.find((candidate) => candidate.id === name.slice("page/".length));
        if (!page) throw new Error(`No page with id ${name.slice("page/".length)}`);
        return `export default ${JSON.stringify(page)};`;
      }
      return undefined;
    },
    async handleHotUpdate({ file, server }) {
      const data = await get();
      if (!data.files.includes(file) || /\.stories\.tsx$/.test(file)) return undefined;
      scanned = undefined;
      for (const module of server.moduleGraph.idToModuleMap.values())
        if (module.id?.startsWith(RESOLVED)) server.moduleGraph.invalidateModule(module);
      server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}
