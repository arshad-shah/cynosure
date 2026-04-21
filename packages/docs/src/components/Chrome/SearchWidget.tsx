import { SearchInput } from '@arshad-shah/cynosure-react';
/**
 * SearchWidget — renders the Cynosure SearchInput and handles Pagefind wiring.
 * Rendered as a React island (`client:load`) so the input is interactive.
 */
import { useEffect, useRef, useState } from 'react';

interface PagefindResult {
  url: string;
  meta: { title?: string };
  excerpt: string;
}
interface PagefindModule {
  search(q: string): Promise<{ results: { data(): Promise<PagefindResult> }[] }>;
}

export default function SearchWidget() {
  const [value, setValue] = useState('');
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [open, setOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState('Search docs…  ⌘K');
  const pagefindRef = useRef<PagefindModule | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const url = /* @vite-ignore */ `${'/pagefind'}/pagefind.js`;
        pagefindRef.current = (await import(/* @vite-ignore */ url)) as PagefindModule;
      } catch {
        setPlaceholder('Search (build docs first)');
      }
    })();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('search')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = async (q: string) => {
    if (!pagefindRef.current || !q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const search = await pagefindRef.current.search(q);
    const items = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));
    setResults(items);
    setOpen(items.length > 0);
  };

  return (
    <div data-search style={{ flex: 1, position: 'relative' }}>
      <SearchInput
        id="search"
        value={value}
        onChange={(v) => {
          setValue(v);
          handleSearch(v);
        }}
        placeholder={placeholder}
        disabled={placeholder.startsWith('Search (')}
        style={{ width: '100%' }}
      />
      {open && (
        <div
          id="search-results"
          aria-live="polite"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--color-bg, canvas)',
            border:
              '1px solid var(--color-border, color-mix(in srgb, currentColor 15%, transparent))',
            borderRadius: 'var(--radius-md, 0.5rem)',
            maxHeight: '60vh',
            overflowY: 'auto',
            zIndex: 20,
          }}
        >
          {results.map((item) => (
            <a
              key={item.url}
              href={item.url}
              style={{
                display: 'block',
                padding: 'var(--space-3, 0.75rem)',
                textDecoration: 'none',
                color: 'inherit',
                borderBottom:
                  '1px solid var(--color-border, color-mix(in srgb, currentColor 8%, transparent))',
              }}
              onClick={() => setOpen(false)}
            >
              <strong>{item.meta.title ?? item.url}</strong>
              <p style={{ margin: '0.25em 0 0', fontSize: '0.875em', opacity: 0.7 }}>
                {item.excerpt.replace(/<[^>]+>/g, '')}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
