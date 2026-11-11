import type { PageData } from "../types";
import { NotFound, Page } from "./Page";
import { RouterProvider, useRouter } from "./router";
import { Shell } from "./Shell";

function Current() {
  const { page } = useRouter();
  return page ? <Page page={page} /> : <NotFound />;
}

/** The whole site: the shell around whichever page the route names. */
export function App({ page, route }: { page: PageData | null; route: string }) {
  return (
    <RouterProvider initial={page} initialRoute={route}>
      <Shell>
        <Current />
      </Shell>
    </RouterProvider>
  );
}
