/**
 * Each Pages deploy replaces every hashed asset. A tab (or a cached page) from the previous deploy then asks for chunks
 * that no longer exist ("Failed to fetch dynamically imported module"). Vite reports that as `vite:preloadError`:
 * reload once to pick up the new deploy. The timestamp guard stops a reload loop if the file is missing for good.
 */
const KEY = "cy-stale-deploy-reload";

export function reloadOnStaleDeploy() {
  window.addEventListener("vite:preloadError", (event) => {
    let last = 0;
    try {
      last = Number(sessionStorage.getItem(KEY) ?? 0);
    } catch {
      // Storage blocked: fall through and reload once per page load at most.
    }
    if (Date.now() - last < 30_000) return;
    try {
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch {}
    event.preventDefault();
    window.location.reload();
  });
}
