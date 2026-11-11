/** The build's entry: renders one route to HTML. Used by `engine/build/build.ts`, never shipped to the browser. */
import pages from "virtual:docs/pages";
import site from "virtual:docs/site";
import { renderToString } from "react-dom/server";
import { App } from "./App";
import { loadPage, titleOf } from "./router";

export { site };
export const routes = Object.keys(pages);

export async function render(route: string | null) {
  const page = route ? await loadPage(route) : null;
  return { html: renderToString(<App page={page} route={route ?? "/404/"} />), title: titleOf(page), page };
}
