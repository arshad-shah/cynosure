export type PagefindResult = {
  url: string;
  meta: { title?: string };
  excerpt: string;
};

export type PagefindModule = {
  search(q: string): Promise<{
    results: { data(): Promise<PagefindResult> }[];
  }>;
};

export async function loadPagefind(): Promise<PagefindModule | null> {
  try {
    const url = /* @vite-ignore */ `${'/pagefind'}/pagefind.js`;
    const mod = (await import(/* @vite-ignore */ url)) as PagefindModule;
    return mod;
  } catch {
    return null;
  }
}

export async function runSearch(pf: PagefindModule, query: string): Promise<PagefindResult[]> {
  const response = await pf.search(query);
  const top = response.results.slice(0, 8);
  return Promise.all(top.map((r) => r.data()));
}

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform;
  return /Mac|iPhone|iPad|iPod/i.test(platform ?? '');
}

export function registerSearchHotkey(open: () => void): () => void {
  const handler = (event: KeyboardEvent): void => {
    if (event.key !== 'k' && event.key !== 'K') return;
    const wantsMeta = isMac() ? event.metaKey : event.ctrlKey;
    if (!wantsMeta) return;
    event.preventDefault();
    open();
  };
  window.addEventListener('keydown', handler);
  return () => {
    window.removeEventListener('keydown', handler);
  };
}
