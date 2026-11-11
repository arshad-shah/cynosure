/**
 * The browser's entry. A built page arrives as HTML and is hydrated; in development there is no HTML yet, so the page
 * is rendered from scratch.
 */
import "@arshad-shah/cynosure/styles.css";
import "@arshad-shah/cynosure/styles/syntax.css";
import "./site.css";
import "../../theme.css";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { loadPage, normalise, titleOf } from "./router";

const root = document.getElementById("root") as HTMLElement;
const route = normalise(location.pathname);
// The page's data is loaded before the first render, so what React renders matches the HTML already on screen.
const page = await loadPage(route);
const app = <App page={page} route={route} />;
if (root.hasChildNodes()) hydrateRoot(root, app);
else {
  document.title = titleOf(page);
  createRoot(root).render(app);
}
