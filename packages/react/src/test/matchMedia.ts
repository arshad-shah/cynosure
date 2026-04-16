import { vi } from 'vitest';

interface MediaState {
  matches: boolean;
  listeners: Set<(event: MediaQueryListEvent) => void>;
}

/**
 * Minimal `window.matchMedia` mock: lets a test set per-query truthiness and
 * dispatch fake `change` events. jsdom ships no implementation of matchMedia
 * so every component touching it needs a stub.
 */
export function installMatchMediaMock(initial: Record<string, boolean> = {}) {
  const state = new Map<string, MediaState>();
  const get = (query: string): MediaState => {
    let entry = state.get(query);
    if (!entry) {
      entry = { matches: initial[query] ?? false, listeners: new Set() };
      state.set(query, entry);
    }
    return entry;
  };

  const matchMedia = vi.fn((query: string): MediaQueryList => {
    const entry = get(query);
    const list: MediaQueryList = {
      matches: entry.matches,
      media: query,
      onchange: null,
      addEventListener: (type: string, handler: EventListenerOrEventListenerObject) => {
        if (type !== 'change' || typeof handler !== 'function') return;
        entry.listeners.add(handler as (event: MediaQueryListEvent) => void);
      },
      removeEventListener: (type: string, handler: EventListenerOrEventListenerObject) => {
        if (type !== 'change' || typeof handler !== 'function') return;
        entry.listeners.delete(handler as (event: MediaQueryListEvent) => void);
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    };
    Object.defineProperty(list, 'matches', {
      get: () => get(query).matches,
    });
    return list;
  });

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: matchMedia,
  });

  return {
    set(query: string, matches: boolean) {
      const entry = get(query);
      entry.matches = matches;
      const event = { matches, media: query } as MediaQueryListEvent;
      for (const listener of entry.listeners) listener(event);
    },
    reset() {
      state.clear();
    },
  };
}
