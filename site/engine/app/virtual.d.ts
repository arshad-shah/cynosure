/// <reference types="vite/client" />

declare module "virtual:docs/site" {
  const site: import("../types").SiteData;
  export default site;
}
declare module "virtual:docs/pages" {
  const pages: Record<string, () => Promise<{ default: import("../types").PageData }>>;
  export default pages;
}
declare module "virtual:docs/search" {
  const search: import("../types").SearchEntry[];
  export default search;
}
declare module "virtual:docs/examples" {
  const examples: Record<string, () => Promise<Record<string, unknown>>>;
  export default examples;
}
